import {
  is,
  each,
  OneOrMore,
  toArray,
  UnknownProps,
  FluidProps,
  Remap,
} from 'shared'
import * as G from 'shared/globals'

import { SpringValues, RangeProps } from './types/spring'
import {
  OnProps,
  OnRest,
  OnStart,
  OnChange,
  AnimationResult,
  AnimationProps,
  LoopProp,
} from './types/animated'
import { Indexable, Falsy } from './types/common'
import { runAsync, scheduleProps, RunAsyncState, AsyncResult } from './runAsync'
import { SpringPhase, CREATED, ACTIVE, IDLE } from './SpringPhase'
import { inferTo } from './helpers'
import { SpringValue, getPropsForLoop } from './SpringValue'
import { FrameValue } from './FrameValue'

/** Events batched by the `Controller` class */
const BATCHED_EVENTS = ['onStart', 'onChange', 'onRest'] as const

/** All event props supported by the `Controller` class */
export type EventProps<State extends object> = {
  /**
   * Called when the # of animating values exceeds 0
   *
   * Also accepts an object for per-key events
   */
  onStart?: (() => void) | { [P in keyof State]?: OnStart<State[P]> }
  /**
   * Called when the # of animating values hits 0
   *
   * Also accepts an object for per-key events
   */
  onRest?: OnRest<State> | { [P in keyof State]?: OnRest<State[P]> }
  /**
   * Called after an animation is updated by new props.
   * Useful for manipulation
   *
   * Also accepts an object for per-key events
   */
  onProps?: OnProps<State> | { [P in keyof State]?: OnProps<State[P]> }
  /**
   * Called once per frame when animations are active
   *
   * Also accepts an object for per-key events
   */
  onChange?:
    | ((values: State) => void)
    | { [P in keyof State]?: OnChange<State[P]> }
}

export type ControllerProps<State extends Indexable = UnknownProps> = Remap<
  FluidProps<Partial<State>> &
    RangeProps<State> &
    EventProps<State> &
    AnimationProps & {
      loop?: LoopProp<ControllerProps<State>>
    }
>

/** An update that hasn't been applied yet */
type PendingProps<State extends Indexable> = ControllerProps<State> & {
  /** The keys affected by this update. When null, all keys are affected. */
  keys: string[] | null
}

/** The flush function that handles `start` calls */
export type FlushFn<State extends Indexable> = (
  ctrl: Controller<State>,
  queue: PendingProps<State>[]
) => AsyncResult<State>

let nextId = 1
let lastAsyncId = 0

export class Controller<State extends Indexable = UnknownProps>
  implements FrameValue.Observer {
  readonly id = nextId++

  /** The animated values */
  springs: SpringValues<State> = {} as any

  /** The queue of pending props */
  queue: PendingProps<State>[] = []

  /** Custom handler for flushing update queues */
  protected _flush?: FlushFn<State>

  /** These props are used by all future spring values */
  protected _initialProps?: Indexable

  /** The combined phase of our spring values */
  protected _phase: SpringPhase = CREATED

  /** The values currently being animated */
  protected _active = new Set<FrameValue>()

  /** State used by the `runAsync` function */
  protected _state: RunAsyncState<State> = {}

  /** The event queues that are flushed once per frame maximum */
  protected _events = {
    onStart: new Set<Function>(),
    onChange: new Set<Function>(),
    onRest: new Map<OnRest, AnimationResult>(),
  }

  constructor(props?: ControllerProps<State> | null, flush?: FlushFn<State>) {
    this._onFrame = this._onFrame.bind(this)
    if (flush) {
      this._flush = flush
    }
    if (props) {
      const { to, ...initialProps } = inferTo(props)
      this._initialProps = initialProps
      if (to) this.start({ to } as any)
    }
  }

  /**
   * Equals `true` when no spring values are in the frameloop, and
   * no async animation is currently active.
   */
  get idle() {
    return (
      !this._state.promise &&
      Object.values(this.springs as Indexable<SpringValue>).every(
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
  update(props: ControllerProps<State> | Falsy) {
    if (props) this.queue.push(createUpdateProps(props))
    return this
  }

  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  start(props?: OneOrMore<ControllerProps<State>> | null): AsyncResult<State> {
    if (!props) {
      props = this.queue
      this.queue = []
    }
    const queue = toArray<any>(props).map(createUpdateProps)
    if (this._flush) {
      return this._flush(this, queue)
    }
    each(queue, props => {
      prepareSprings(this.springs, props, key => {
        return createSpring(key, this._initialProps, this)
      })
    })
    return flushUpdateQueue(this, queue)
  }

  /** Stop one animation, some animations, or all animations */
  stop(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.each(spring => spring.stop())
    } else {
      const springs = this.springs as Indexable<SpringValue>
      each(toArray(keys), key => springs[key].stop())
    }
    return this
  }

  /** Freeze the active animation in time */
  pause(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.each(spring => spring.pause())
    } else {
      const springs = this.springs as Indexable<SpringValue>
      each(toArray(keys), key => springs[key].pause())
    }
    return this
  }

  /** Resume the animation if paused. */
  resume(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      this.each(spring => spring.resume())
    } else {
      const springs = this.springs as Indexable<SpringValue>
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
      flush(onRest, (result, onRest) => {
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

/** Find keys with defined values */
function findDefined(values: any, keys: Set<string>) {
  each(values, (value, key) => value != null && keys.add(key as any))
}

/** Basic helper for clearing a queue after processing it */
function flush<P, T>(
  queue: Map<P, T>,
  iterator: (value: T, key: P) => void
): void
function flush<T>(queue: Set<T>, iterator: (value: T) => void): void
function flush(queue: any, iterator: any) {
  if (queue.size) {
    each(queue, iterator)
    queue.clear()
  }
}

/**
 * Warning: Props might be mutated.
 */
export function flushUpdateQueue(
  ctrl: Controller<any>,
  queue: PendingProps<any>[]
) {
  return Promise.all(queue.map(props => flushUpdate(ctrl, props))).then(
    results => ({
      value: ctrl.get(),
      finished: results.every(finished => finished),
    })
  )
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
  props: PendingProps<any>
): Promise<boolean> {
  const { to, loop } = props

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
      props[key] =
        queue instanceof Set
          ? () => queue.add(handler)
          : ((({ finished, cancelled }: AnimationResult) => {
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
            }) as any)
    }
  })

  const keys = props.keys || Object.keys(ctrl.springs)
  const promises = keys.map(key => ctrl.springs[key]!.start(props as any))

  // Schedule the "asyncTo" if defined.
  if (asyncTo) {
    const state = ctrl['_state']
    promises.push(
      scheduleProps(++lastAsyncId, {
        props,
        state,
        action(props, resolve) {
          // Start, replace, or cancel the async animation.
          props.onRest = undefined
          resolve(
            runAsync<any>(
              asyncTo,
              props,
              state,
              ctrl.get.bind(ctrl),
              () => false, // TODO: add pausing to Controller
              ctrl.start.bind(ctrl) as any,
              ctrl.stop.bind(ctrl)
            )
          )
        },
      })
    )
  }

  return Promise.all(promises).then(results => {
    const finished = results.every(result => result.finished)
    if (finished && loop) {
      const nextProps = getPropsForLoop(props, loop, to)
      if (nextProps) {
        return flushUpdate(ctrl, nextProps)
      }
    }
    return finished
  })
}

export function createUpdateProps(props: any) {
  if ('keys' in props) return props
  const { to, from } = (props = inferTo(props))

  // Collect the keys affected by this update.
  const keys = new Set<string>()

  if (from) {
    findDefined(from, keys)
  } else {
    // Falsy values are ignored.
    props.from = undefined
  }

  if (is.obj(to)) {
    findDefined(to, keys)
  } else if (!to) {
    // Falsy values are ignored.
    props.to = undefined
  }

  props.keys = keys.size ? Array.from(keys) : null
  return props
}

/**
 * From an array of updates, get the map of `SpringValue` objects
 * by their keys. Springs are created when any update wants to
 * animate a new key.
 */
export function getSprings<State>(
  ctrl: Controller<State>,
  props?: OneOrMore<ControllerProps<State>>
) {
  const springs = { ...ctrl.springs }
  if (props) {
    const initialProps = ctrl['_initialProps']
    each(toArray(props), (props: any) => {
      props = createUpdateProps(props)
      if (!is.obj(props.to)) {
        // Avoid passing array/function to each spring.
        props = { ...props, to: undefined }
      }
      prepareSprings(springs, props, key => {
        return createSpring(key, initialProps)
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

function createSpring(
  key: string,
  initialProps?: UnknownProps,
  observer?: FrameValue.Observer
) {
  const spring = new SpringValue(initialProps)
  spring.key = key
  if (observer) {
    spring.addChild(observer)
  }
  return spring
}

function prepareSprings(
  springs: any,
  props: PendingProps<any>,
  create: (key: string) => SpringValue
) {
  if (props.keys) {
    each(props.keys, key => {
      const spring = springs[key] || (springs[key] = create(key))
      spring['_prepareNode'](props)
    })
  }
}
