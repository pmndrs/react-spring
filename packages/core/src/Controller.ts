import {
  is,
  each,
  OneOrMore,
  toArray,
  UnknownProps,
  UnknownPartial,
  FluidProps,
} from 'shared'
import * as G from 'shared/globals'

import { SpringUpdate, SpringValues } from './types/spring'
import {
  OnAnimate,
  OnRest,
  OnStart,
  OnChange,
  AnimationResult,
} from './types/animated'
import { Indexable, Falsy } from './types/common'
import { runAsync, scheduleProps, RunAsyncState, AsyncResult } from './runAsync'
import { SpringPhase, CREATED, ACTIVE, IDLE } from './SpringPhase'
import { interpolateTo } from './helpers'
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
   * Called whenever an animation gets new props
   *
   * Also accepts an object for per-key events
   */
  onAnimate?: OnAnimate | Indexable<OnAnimate>
  /**
   * Called once per frame when animations are active
   *
   * Also accepts an object for per-key events
   */
  onChange?: ((frame: State & UnknownProps) => void) | Indexable<OnChange>
}

export type ControllerProps<State extends Indexable = Indexable> = unknown &
  EventProps<State> &
  SpringUpdate<State> &
  UnknownPartial<FluidProps<State>>

/** An update that hasn't been applied yet */
type PendingProps<State extends Indexable> = ControllerProps<State> & {
  keys: string[]
}

let nextId = 1
let lastAsyncId = 0

export class Controller<State extends Indexable = UnknownProps>
  implements FrameValue.Observer {
  readonly id = nextId++

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

  /** The spring values that manage their animations */
  protected _springs: Indexable<SpringValue> = {}

  /** The event queues that are flushed once per frame maximum */
  protected _events = {
    onStart: new Set<Function>(),
    onChange: new Set<Function>(),
    onRest: new Map<OnRest, AnimationResult>(),
  }

  constructor(props?: ControllerProps<State>) {
    this._onFrame = this._onFrame.bind(this)
    if (props) {
      const { to, ...initialProps } = interpolateTo(props as any)
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
      Object.values(this._springs).every(spring => spring.idle)
    )
  }

  /** Get all existing `SpringValue` objects. This clones the internal store. */
  get springs() {
    return { ...this._springs } as SpringValues<State>
  }

  /** Get an existing `SpringValue` object by its key. */
  get<P extends keyof State>(key: P): SpringValue<State[P]>
  get(key: string): SpringValue<unknown> | undefined
  get(key: string) {
    return this._springs[key as any]
  }

  /** Push an update onto the queue of each value. */
  update(props: ControllerProps<State> | Falsy) {
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
  start(queue?: OneOrMore<ControllerProps<State>>) {
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
      each(keys, key => {
        promises.push(this._springs[key].start(props))
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
                runAsync<State>(
                  asyncTo,
                  props,
                  state,
                  this._get.bind(this),
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
      value: this._get(),
      finished: results.every(result => result.finished),
    }))
  }

  /** Stop one animation, some animations, or all animations */
  stop(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      each(this._springs, spring => spring.stop())
    } else {
      each(toArray(keys), key => this._springs[key].stop())
    }
    return this
  }

  /** Restart every animation. */
  reset() {
    each(this._springs, spring => spring.reset())
    // TODO: restart async "to" prop
    return this
  }

  /** Destroy every spring in this controller */
  dispose() {
    this._state.asyncTo = undefined
    each(this._springs, spring => spring.dispose())
    this._springs = {}
  }

  /** Get the current value of every spring */
  protected _get() {
    const values: any = {}
    each(this._springs, (spring, key) => {
      values[key] = spring.get()
    })
    return values
  }

  /** Prepare an update with the given props. */
  protected _prepareUpdate(propsArg: ControllerProps<State>) {
    const props: PendingProps<State> = interpolateTo(propsArg) as any
    props.keys = extractKeys(props, this._springs)

    let { from, to } = props as any

    // Avoid sending async "to" prop to springs.
    if (is.arr(to) || is.fun(to)) {
      to = undefined
    }

    // Create our springs and give them values.
    if (from || to) {
      each(props.keys, key => {
        if (!this._springs[key]) {
          const spring = (this._springs[key] = new SpringValue(
            this._initialProps
          ))
          spring.key = key
          spring.addChild(this)
          spring.setNodeWithProps({ from, to })
        }
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

    const values = (onChange.size || (!isActive && onRest.size)) && this._get()
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

/** Determine which keys should receive an update */
function extractKeys(props: ControllerProps, springs: Indexable<SpringValue>) {
  const keys = new Set<string>()

  /** Collect keys with a defined value */
  const getDefinedKeys = (obj: Indexable) =>
    each(obj, (value, key) => {
      if (!is.und(value)) {
        keys.add(key as string)
      }
    })

  const { from, to } = props
  if (is.obj(to)) getDefinedKeys(to)
  if (from) getDefinedKeys(from)

  // When neither "from" or "to" have a key with a defined value,
  // return the keys for every existing spring.
  return keys.size ? Array.from(keys) : Object.keys(springs)
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
