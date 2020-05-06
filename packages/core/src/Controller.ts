import { is, each, OneOrMore, toArray, UnknownProps, noop } from 'shared'
import * as G from 'shared/globals'

import { Lookup, Falsy } from './types/common'
import { flush, hasDefaultProp } from './helpers'
import { FrameValue } from './FrameValue'
import { SpringPhase, CREATED, ACTIVE, IDLE } from './SpringPhase'
import { SpringValue, createLoopUpdate, createUpdate } from './SpringValue'
import {
  getCombinedResult,
  AnimationResult,
  AsyncResult,
} from './AnimationResult'
import { runAsync, scheduleProps, RunAsyncState, cancelAsync } from './runAsync'
import {
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

  /** Custom handler for flushing update queues */
  protected _flush?: ControllerFlushFn<State>

  /** These props are used by all future spring values */
  protected _initialProps?: Lookup

  /** The combined phase of our spring values */
  protected _phase: SpringPhase = CREATED

  /** The counter for tracking `scheduleProps` calls */
  protected _lastAsyncId = 0

  /** The values currently being animated */
  protected _active = new Set<FrameValue>()

  /** State used by the `runAsync` function */
  protected _state: RunAsyncState<State> = {
    pauseQueue: new Set(),
    resumeQueue: new Set(),
  }

  /** The event queues that are flushed once per frame maximum */
  protected _events = {
    onStart: new Set<Function>(),
    onChange: new Set<Function>(),
    onRest: new Map<OnRest, AnimationResult>(),
  }

  constructor(
    props?: ControllerUpdate<State> | null,
    flush?: ControllerFlushFn<State>
  ) {
    this._onFrame = this._onFrame.bind(this)
    if (flush) {
      this._flush = flush
    }
    if (props) {
      this.start(props)
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

  /** Check the current phase */
  is(phase: SpringPhase) {
    return this._phase == phase
  }

  /** Get the current values of our springs */
  get(): State & UnknownProps {
    const values: any = {}
    this.each((spring, key) => (values[key] = spring.get()))
    return values
  }

  /** Push an update onto the queue of each value. */
  update(props: ControllerUpdate<State> | Falsy) {
    if (props) this.queue.push(createUpdate(props))
    return this
  }

  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  start(props?: OneOrMore<ControllerUpdate<State>> | null): AsyncResult<State> {
    const queue = props ? toArray<any>(props).map(createUpdate) : this.queue
    if (!props) {
      this.queue = []
    }
    if (this._flush) {
      return this._flush(this, queue)
    }
    prepareKeys(this, queue)
    return flushUpdateQueue(this, queue)
  }

  /** Stop one animation, some animations, or all animations */
  stop(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.each(spring => spring.stop())
      cancelAsync(this._state, this._lastAsyncId)
    } else {
      const springs = this.springs as Lookup<SpringValue>
      each(toArray(keys), key => springs[key].stop())
    }
    return this
  }

  /** Freeze the active animation in time */
  pause(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.each(spring => spring.pause())
    } else {
      const springs = this.springs as Lookup<SpringValue>
      each(toArray(keys), key => springs[key].pause())
    }
    return this
  }

  /** Resume the animation if paused. */
  resume(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.each(spring => spring.resume())
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

  /** Destroy every spring in this controller */
  dispose() {
    this._state.asyncTo = undefined
    this.each(spring => spring.dispose())
    this.springs = {} as any
  }

  /** @internal Called at the end of every animation frame */
  protected _onFrame() {
    const { onStart, onChange, onRest } = this._events

    const isActive = this._active.size > 0
    if (isActive && this._phase != ACTIVE) {
      this._phase = ACTIVE
      flush(onStart, onStart => onStart())
    }

    const values = (onChange.size || (!isActive && onRest.size)) && this.get()
    flush(onChange, onChange => onChange(values))

    // The "onRest" queue is only flushed when all springs are idle.
    if (!isActive) {
      this._phase = IDLE
      flush(onRest, ([onRest, result]) => {
        result.value = values
        onRest(result)
      })
    }
  }

  /** @internal */
  onParentChange(event: FrameValue.Event) {
    if (event.type == 'change') {
      this._active[event.idle ? 'delete' : 'add'](event.parent)
      G.frameLoop.onFrame(this._onFrame)
    }
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
export function flushUpdate(
  ctrl: Controller<any>,
  props: ControllerQueue[number],
  isLoop?: boolean
): AsyncResult {
  const { to, loop, onRest } = props

  const asyncTo = is.arr(to) || is.fun(to) ? to : undefined
  if (asyncTo) {
    props.to = undefined
  }

  // Looping must be handled in this function, or else the values
  // would end up looping out-of-sync in many common cases.
  if (loop) {
    props.loop = false
  }

  // Batched events are queued by individual spring values.
  each(BATCHED_EVENTS, key => {
    const handler: any = props[key]
    if (is.fun(handler)) {
      const queue = ctrl['_events'][key]
      if (queue instanceof Set) {
        props[key] = () => queue.add(handler)
      } else if (asyncTo) {
        // The "runAsync" function will call our handler.
        props[key] = undefined
      } else {
        props[key] = (({ finished, cancelled }: AnimationResult) => {
          const result = queue.get(handler)
          if (result) {
            if (!finished) result.finished = false
            if (cancelled) result.cancelled = true
          } else {
            // The "value" is set before the "handler" is called.
            queue.set(handler, {
              value: null,
              finished,
              cancelled,
            })
          }
        }) as any
      }
    }
  })

  const keys = props.keys || Object.keys(ctrl.springs)
  const promises = keys.map(key => ctrl.springs[key]!.start(props as any))

  // Schedule the "asyncTo" if defined.
  const state = ctrl['_state']
  if (asyncTo) {
    promises.push(
      scheduleProps(++ctrl['_lastAsyncId'], {
        props,
        state,
        actions: {
          pause: noop,
          resume: noop,
          start(props, resolve) {
            props.onRest = onRest as any
            if (!props.cancel) {
              resolve(runAsync(asyncTo, props, state, ctrl))
            }
            // Prevent `cancel: true` from ending the current `runAsync` call,
            // except when the default `cancel` prop is being set.
            else if (hasDefaultProp(props, 'cancel')) {
              cancelAsync(state, props.callId)
            }
          },
        },
      })
    )
  }
  // Respect the `cancel` prop when no keys are affected.
  else if (!props.keys && props.cancel === true) {
    cancelAsync(state, ctrl['_lastAsyncId'])
  }

  return Promise.all(promises).then(results => {
    const result = getCombinedResult<any>(ctrl, results)
    if (loop && result.finished && !(isLoop && result.noop)) {
      const nextProps = createLoopUpdate(props, loop, to)
      if (nextProps) {
        prepareKeys(ctrl, [nextProps])
        return flushUpdate(ctrl, nextProps, true)
      }
    }
    return result
  })
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
