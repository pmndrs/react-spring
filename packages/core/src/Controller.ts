import { OneOrMore, UnknownProps, Lookup, Falsy } from '@react-spring/types'
import {
  is,
  each,
  flush,
  toArray,
  flushCalls,
  Globals as G,
  noop,
} from '@react-spring/shared'

import { getDefaultProp } from './helpers'
import { FrameValue } from './FrameValue'
import { SpringRef } from './SpringRef'
import { SpringValue, createLoopUpdate, createUpdate } from './SpringValue'
import { getCancelledResult, getCombinedResult } from './AnimationResult'
import { runAsync, RunAsyncState, stopAsync } from './runAsync'
import { scheduleProps } from './scheduleProps'
import {
  AnimationResult,
  AsyncResult,
  ControllerFlushFn,
  ControllerUpdate,
  OnRest,
  SpringValues,
} from './types'

/** Events batched by the `Controller` class */
const BATCHED_EVENTS = ['onStart', 'onChange', 'onRest'] as const

let nextId = 1

/** Queue of pending updates for a `Controller` instance. */
export interface ControllerQueue<State extends Lookup = Lookup>
  extends Array<
    ControllerUpdate<State> & {
      /** The keys affected by this update. When null, all keys are affected. */
      keys: string[] | null
    }
  > {}

export class Controller<State extends Lookup = Lookup>
  implements FrameValue.Observer {
  readonly id = nextId++

  /** The animated values */
  springs: SpringValues<State> = {} as any

  /** The queue of props passed to the `update` method. */
  queue: ControllerQueue<State> = []

  /**
   * The injected ref. When defined, render-based updates are pushed
   * onto the `queue` instead of being auto-started.
   */
  ref?: SpringRef<State>

  /** Custom handler for flushing update queues */
  protected _flush?: ControllerFlushFn<this>

  /** These props are used by all future spring values */
  protected _initialProps?: Lookup

  /** The counter for tracking `scheduleProps` calls */
  protected _lastAsyncId = 0

  /** The values currently being animated */
  protected _active = new Set<FrameValue>()

  /** The values that changed recently */
  protected _changed = new Set<FrameValue>()

  /** Equals false when `onStart` listeners can be called */
  protected _started = false

  /** State used by the `runAsync` function */
  protected _state: RunAsyncState<this> = {
    paused: false,
    pauseQueue: new Set(),
    resumeQueue: new Set(),
    timeouts: new Set(),
  }

  /** The event queues that are flushed once per frame maximum */
  protected _events = {
    onStart: new Set<(ctrl: Controller<State>) => void>(),
    onChange: new Set<(values: object) => void>(),
    onRest: new Map<OnRest, AnimationResult>(),
  }

  constructor(
    props?: ControllerUpdate<State> | null,
    flush?: ControllerFlushFn<any>
  ) {
    this._onFrame = this._onFrame.bind(this)
    if (flush) {
      this._flush = flush
    }
    if (props) {
      this.start({ default: true, ...props })
    }
  }

  /**
   * Equals `true` when no spring values are in the frameloop, and
   * no async animation is currently active.
   */
  get idle() {
    return (
      !this._state.asyncTo &&
      Object.values(this.springs as Lookup<SpringValue>).every(
        spring => spring.idle
      )
    )
  }

  /** Get the current values of our springs */
  get(): State & UnknownProps {
    const values: any = {}
    this.each((spring, key) => (values[key] = spring.get()))
    return values
  }

  /** Push an update onto the queue of each value. */
  update(props: ControllerUpdate<State> | Falsy) {
    if (props) {
      this.queue.push(createUpdate(props))
    }
    return this
  }

  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  start(props?: OneOrMore<ControllerUpdate<State>> | null): AsyncResult<this> {
    let { queue } = this as any
    if (props) {
      queue = toArray<any>(props).map(createUpdate)
    } else {
      this.queue = []
    }

    if (this._flush) {
      return this._flush(this, queue)
    }

    prepareKeys(this, queue)
    return flushUpdateQueue(this, queue)
  }

  /** Stop all animations. */
  stop(): this
  /** Stop animations for the given keys. */
  stop(keys: OneOrMore<string>): this
  /** Cancel all animations. */
  stop(cancel: boolean): this
  /** Cancel animations for the given keys. */
  stop(cancel: boolean, keys: OneOrMore<string>): this
  /** Stop some or all animations. */
  stop(keys?: OneOrMore<string>): this
  /** Cancel some or all animations. */
  stop(cancel: boolean, keys?: OneOrMore<string>): this
  /** @internal */
  stop(arg?: boolean | OneOrMore<string>, keys?: OneOrMore<string>) {
    if (arg !== !!arg) {
      keys = arg as OneOrMore<string>
    }
    if (keys) {
      const springs = this.springs as Lookup<SpringValue>
      each(toArray(keys), key => springs[key].stop(!!arg))
    } else {
      stopAsync(this._state, this._lastAsyncId)
      this.each(spring => spring.stop(!!arg))
    }
    return this
  }

  /** Freeze the active animation in time */
  pause(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.start({ pause: true })
    } else {
      const springs = this.springs as Lookup<SpringValue>
      each(toArray(keys), key => springs[key].pause())
    }
    return this
  }

  /** Resume the animation if paused. */
  resume(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.start({ pause: false })
    } else {
      const springs = this.springs as Lookup<SpringValue>
      each(toArray(keys), key => springs[key].resume())
    }
    return this
  }

  /** Restart every animation. */
  reset() {
    this.each(spring => spring.reset())
    // TODO: restart async "to" prop
    return this
  }

  /** Call a function once per spring value */
  each(iterator: (spring: SpringValue, key: string) => void) {
    each(this.springs, iterator as any)
  }

  /** @internal Called at the end of every animation frame */
  protected _onFrame() {
    const { onStart, onChange, onRest } = this._events

    const active = this._active.size > 0
    if (active && !this._started) {
      this._started = true
      flushCalls(onStart, this)
    }

    const idle = !active && this._started
    const changed = this._changed.size > 0 && onChange.size
    const values = changed || (idle && onRest.size) ? this.get() : null

    if (changed) {
      flushCalls(onChange, values!)
    }

    // The "onRest" queue is only flushed when all springs are idle.
    if (idle) {
      this._started = false
      flush(onRest, ([onRest, result]) => {
        result.value = values
        onRest(result)
      })
    }
  }

  /** @internal */
  onParentChange(event: FrameValue.Event) {
    if (event.type == 'change') {
      this._changed.add(event.parent)
      if (!event.idle) {
        this._active.add(event.parent)
      }
    } else if (event.type == 'idle') {
      this._active.delete(event.parent)
    }
    // The `onFrame` handler runs when a parent is changed or idle.
    else return
    G.frameLoop.onFrame(this._onFrame)
  }
}

/**
 * Warning: Props might be mutated.
 */
export function flushUpdateQueue(
  ctrl: Controller<any>,
  queue: ControllerQueue
) {
  return Promise.all(
    queue.map(props => flushUpdate(ctrl, props))
  ).then(results => getCombinedResult(ctrl, results))
}

/**
 * Warning: Props might be mutated.
 *
 * Process a single set of props using the given controller.
 *
 * The returned promise resolves to `true` once the update is
 * applied and any animations it starts are finished without being
 * stopped or cancelled.
 */
export async function flushUpdate(
  ctrl: Controller<any>,
  props: ControllerQueue[number],
  isLoop?: boolean
): AsyncResult {
  const { keys, to, from, loop, onRest } = props
  const defaults = is.obj(props.default) && props.default

  // Looping must be handled in this function, or else the values
  // would end up looping out-of-sync in many common cases.
  if (loop) {
    props.loop = false
  }

  // Treat false like null, which gets ignored.
  if (to === false) props.to = null
  if (from === false) props.from = null

  const asyncTo = is.arr(to) || is.fun(to) ? to : undefined
  if (asyncTo) {
    props.to = undefined
    props.onRest = undefined
    if (defaults) {
      defaults.onRest = undefined
    }
  }
  // For certain events, use batching to prevent multiple calls per frame.
  // However, batching is avoided when the `to` prop is async, because any
  // event props are used as default props instead.
  else {
    each(BATCHED_EVENTS, key => {
      const handler: any = props[key]
      if (is.fun(handler)) {
        const queue = ctrl['_events'][key]
        if (queue instanceof Set) {
          props[key] = () => queue.add(handler)
        } else {
          props[key] = (({ finished, cancelled }: AnimationResult) => {
            const result = queue.get(handler)
            if (result) {
              if (!finished) result.finished = false
              if (cancelled) result.cancelled = true
            } else {
              // The "value" is set before the "handler" is called.
              queue.set(handler, {
                target: ctrl,
                value: null,
                finished,
                cancelled,
              })
            }
          }) as any
        }
        // Avoid using a batched `handler` as a default prop.
        if (defaults) {
          defaults[key] = props[key] as any
        }
      }
    })
  }

  const state = ctrl['_state']

  // Pause/resume the `asyncTo` when `props.pause` is true/false.
  if (props.pause === !state.paused) {
    state.paused = props.pause
    flushCalls(props.pause ? state.pauseQueue : state.resumeQueue)
  }
  // When a controller is paused, its values are also paused.
  else if (state.paused) {
    props.pause = true
  }

  const promises: AsyncResult[] = (keys || Object.keys(ctrl.springs)).map(key =>
    ctrl.springs[key]!.start(props as any)
  )

  const cancel =
    props.cancel === true || getDefaultProp(props, 'cancel') === true

  if (asyncTo || (cancel && state.asyncId)) {
    promises.push(
      scheduleProps(++ctrl['_lastAsyncId'], {
        props,
        state,
        actions: {
          pause: noop,
          resume: noop,
          start(props, resolve) {
            if (cancel) {
              stopAsync(state, ctrl['_lastAsyncId'])
              resolve(getCancelledResult(ctrl))
            } else {
              props.onRest = onRest
              resolve(runAsync(asyncTo!, props, state, ctrl))
            }
          },
        },
      })
    )
  }

  // Pause after updating each spring, so they can be resumed separately
  // and so their default `pause` and `cancel` props are updated.
  if (state.paused) {
    // Ensure `this` must be resumed before the returned promise
    // is resolved and before starting the next `loop` repetition.
    await new Promise(resume => {
      state.resumeQueue.add(resume)
    })
  }

  const result = getCombinedResult<any>(ctrl, await Promise.all(promises))
  if (loop && result.finished && !(isLoop && result.noop)) {
    const nextProps = createLoopUpdate(props, loop, to)
    if (nextProps) {
      prepareKeys(ctrl, [nextProps])
      return flushUpdate(ctrl, nextProps, true)
    }
  }
  return result
}

/**
 * From an array of updates, get the map of `SpringValue` objects
 * by their keys. Springs are created when any update wants to
 * animate a new key.
 *
 * Springs created by `getSprings` are neither cached nor observed
 * until they're given to `setSprings`.
 */
export function getSprings<State extends Lookup>(
  ctrl: Controller<State>,
  props?: OneOrMore<ControllerUpdate<State>>
) {
  const springs = { ...ctrl.springs }
  if (props) {
    each(toArray(props), (props: any) => {
      if (is.und(props.keys)) {
        props = createUpdate(props)
      }
      if (!is.obj(props.to)) {
        // Avoid passing array/function to each spring.
        props = { ...props, to: undefined }
      }
      prepareSprings(springs as any, props, key => {
        return createSpring(key)
      })
    })
  }
  return springs
}

/**
 * Tell a controller to manage the given `SpringValue` objects
 * whose key is not already in use.
 */
export function setSprings(
  ctrl: Controller,
  springs: SpringValues<UnknownProps>
) {
  each(springs, (spring, key) => {
    if (!ctrl.springs[key]) {
      ctrl.springs[key] = spring
      spring.addChild(ctrl)
    }
  })
}

function createSpring(key: string, observer?: FrameValue.Observer) {
  const spring = new SpringValue()
  spring.key = key
  if (observer) {
    spring.addChild(observer)
  }
  return spring
}

/**
 * Ensure spring objects exist for each defined key.
 *
 * Using the `props`, the `Animated` node of each `SpringValue` may
 * be created or updated.
 */
function prepareSprings(
  springs: SpringValues,
  props: ControllerQueue[number],
  create: (key: string) => SpringValue
) {
  if (props.keys) {
    each(props.keys, key => {
      const spring = springs[key] || (springs[key] = create(key))
      spring['_prepareNode'](props)
    })
  }
}

/**
 * Ensure spring objects exist for each defined key, and attach the
 * `ctrl` to them for observation.
 *
 * The queue is expected to contain `createUpdate` results.
 */
function prepareKeys(ctrl: Controller<any>, queue: ControllerQueue[number][]) {
  each(queue, props => {
    prepareSprings(ctrl.springs, props, key => {
      return createSpring(key, ctrl)
    })
  })
}
