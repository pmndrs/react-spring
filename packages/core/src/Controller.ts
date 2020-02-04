import {
  is,
  each,
  OneOrMore,
  toArray,
  UnknownProps,
  UnknownPartial,
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
} from './types/animated'
import { Indexable, Falsy } from './types/common'
import { runAsync, scheduleProps, RunAsyncState, AsyncResult } from './runAsync'
import { SpringPhase, CREATED, ACTIVE, IDLE } from './SpringPhase'
import { inferTo } from './helpers'
import { SpringValue } from './SpringValue'
import { FrameValue } from './FrameValue'

/** Events batched by the `Controller` class */
const BATCHED_EVENTS = ['onStart', 'onChange', 'onRest'] as const

/** All event props supported by the `Controller` class */
export interface EventProps<State extends Indexable> {
  /**
   * Called when the # of animating values exceeds 0
   *
   * Also accepts an object for per-key events
   */
  onStart?: (() => void) | Indexable<OnStart>
  /**
   * Called when the # of animating values hits 0
   *
   * Also accepts an object for per-key events
   */
  onRest?: OnRest<State> | Indexable<OnRest>
  /**
   * Called after an animation is updated by new props.
   * Useful for manipulation
   *
   * Also accepts an object for per-key events
   */
  onProps?: OnProps | Indexable<OnProps>
  /**
   * Called once per frame when animations are active
   *
   * Also accepts an object for per-key events
   */
  onChange?: ((values: UnknownPartial<State>) => void) | Indexable<OnChange>
}

export type ControllerProps<State extends Indexable = UnknownProps> = Remap<
  FluidProps<State> &
    RangeProps<State> &
    EventProps<UnknownPartial<State>> &
    AnimationProps
>

/** An update that hasn't been applied yet */
type PendingProps<State extends Indexable> = ControllerProps<State> & {
  keys: Set<string>
}

let nextId = 1
let lastAsyncId = 0

export class Controller<State extends Indexable = UnknownProps>
  implements FrameValue.Observer {
  readonly id = nextId++

  /** The animated values */
  springs: SpringValues<State> = {} as any

  /** The queue of pending props */
  queue: PendingProps<State>[] = []

  /** These props are used by all future spring values */
  protected _initialProps?: Indexable

  /** The combined phase of our spring values */
  protected _phase: SpringPhase = CREATED

  /** The values currently being animated */
  protected _active = new Set<FrameValue>()

  /** Event handlers and async state are stored here */
  protected _state: RunAsyncState<State> = {}

  /** The event queues that are flushed once per frame maximum */
  protected _events = {
    onStart: new Set<Function>(),
    onChange: new Set<Function>(),
    onRest: new Map<OnRest, AnimationResult>(),
  }

  constructor(props?: ControllerProps<State>) {
    this._onFrame = this._onFrame.bind(this)
    if (props) {
      const { to, ...initialProps } = inferTo(props as any)
      this._initialProps = initialProps
      if (to) this.start({ to })
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
  update(props: UnknownPartial<ControllerProps<State>> | Falsy) {
    if (props) this.queue.push(this._prepareUpdate(props))
    return this
  }

  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  start(queue?: OneOrMore<UnknownPartial<ControllerProps<State>>>) {
    if (queue) {
      queue = toArray<any>(queue).map(props => this._prepareUpdate(props))
    } else {
      queue = this.queue
      this.queue = []
    }

    const promises: AsyncResult[] = []
    each(queue as PendingProps<State>[], props => {
      const { to, keys } = props

      const asyncTo = (is.arr(to) || is.fun(to)) && to
      if (asyncTo) {
        props.to = undefined
      }

      // Batched events are queued by individual spring values.
      each(BATCHED_EVENTS, key => {
        const handler: any = props[key]
        if (is.fun(handler)) {
          const queue = this._events[key]
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

      // Send updates to every affected key.
      const springs = this.springs as Indexable<SpringValue>
      each(keys.size ? keys : Object.keys(springs), key => {
        promises.push(springs[key].start(props))
      })

      // Schedule controller-only props.
      const state = this._state
      promises.push(
        scheduleProps(++lastAsyncId, {
          props,
          state,
          action: (props, resolve) => {
            // Start, replace, or cancel the async animation.
            if (asyncTo) {
              props.onRest = undefined
              resolve(
                runAsync<any>(
                  asyncTo,
                  props,
                  state,
                  this.get.bind(this),
                  () => false, // TODO: add pausing to Controller
                  this.start.bind(this) as any,
                  this.stop.bind(this) as any
                )
              )
            } else {
              resolve({
                value: 0, // This value gets ignored.
                finished: !props.cancel,
                cancelled: props.cancel,
              })
            }
          },
        })
      )
    })

    return Promise.all(promises).then(results => ({
      value: this.get(),
      finished: results.every(result => result.finished),
    }))
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

  /** Prepare an update with the given props. */
  protected _prepareUpdate(propsArg: UnknownPartial<ControllerProps<State>>) {
    const props: PendingProps<State> = inferTo(propsArg) as any
    let { from, to, reverse, delay } = props as any

    // Each update only affects the springs whose keys have defined values.
    const keys = (props.keys = new Set<string>())

    if (from) {
      findDefined(from, keys)
    } else {
      // Falsy values are ignored.
      props.from = from = undefined
    }

    if (is.obj(to)) {
      findDefined(to, keys)
    } else {
      // Falsy values are ignored.
      if (!to) props.to = undefined
      // Avoid passing functions/arrays to SpringValue objects.
      to = undefined
    }

    // Create our springs and give them values.
    const springs = this.springs as Indexable<SpringValue>
    if (keys.size) {
      each(keys, key => {
        let spring = springs[key]
        if (!spring) {
          spring = springs[key] = new SpringValue(this._initialProps)
          spring.key = key
          spring.addChild(this)
        }
        // Ensure the spring is using its latest "from" value.
        spring['_prepareNode']({ from, to, reverse, delay })
      })
    }

    return props
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
