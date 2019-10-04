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

import { SpringProps, SpringValues } from './types/spring'
import { AnimationEvents } from './types/animated'
import { Indexable, Falsy } from './types/common'
import { runAsync, scheduleProps, RunAsyncState, AsyncResult } from './runAsync'
import { interpolateTo } from './helpers'
import { SpringValue } from './SpringValue'
import { AnimationValue } from '@react-spring/animated'

/** A callback that receives the changed values for each frame. */
export type OnFrame<State extends Indexable> = (
  frame: UnknownPartial<State>
) => void

export type ControllerProps<State extends Indexable = UnknownProps> = {
  /**
   * Called on every frame when animations are active
   */
  onFrame?: OnFrame<State>
} & SpringProps<State> &
  AnimationEvents<unknown> &
  UnknownPartial<FluidProps<State>>

/** The props that are cached by `Controller` objects */
interface CachedProps<State extends Indexable> extends RunAsyncState<State> {
  onFrame?: OnFrame<State>
}

/** An update that hasn't been applied yet */
type PendingProps<State extends Indexable> = ControllerProps<State> & {
  keys: string[]
}

/** Default props for the `Controller` class */
type DefaultProps<State extends Indexable> = {
  onFrame?: OnFrame<State>
}

let nextId = 1
let lastAsyncId = 0

export class Controller<State extends Indexable = UnknownProps> {
  readonly id = nextId++

  /** The values that changed in the last animation frame */
  frame: UnknownPartial<State> = {}

  /** Fallback values for undefined props */
  defaultProps: DefaultProps<State> = {}

  /** The queue of pending props */
  queue: PendingProps<State>[] = []

  /** The current controller-only props (eg: `onFrame` and async state) */
  protected _state: CachedProps<State> = {}

  /** The spring values that manage their animations */
  protected _springs: Indexable<SpringValue> = {}

  constructor(props?: ControllerProps<State>) {
    this._onChange = this._onChange.bind(this)
    this._onFrame = this._onFrame.bind(this)
    if (props) {
      props.default = true
      this.start(props)
    }
  }

  /** Equals true when no springs are animating */
  get idle() {
    return (
      !this._state.promise && Object.values(this._springs).every(s => s.idle)
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
    if (props) this.queue.push(this._update(props))
    return this
  }

  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  async start(queue?: OneOrMore<ControllerProps<State>>) {
    if (queue) {
      queue = toArray<any>(queue).map(props => this._update(props))
    } else {
      queue = this.queue
      this.queue = []
    }

    const promises: AsyncResult[] = []
    each(queue as PendingProps<State>[], props => {
      const { to, onFrame, keys } = props
      const asyncTo = (is.arr(to) || is.fun(to)) && to
      if (asyncTo) {
        props.to = undefined
      }
      const state = this._state
      promises.push(
        // Send updates to every affected key.
        ...keys.map(key => this._springs[key].start(props as any)),
        // Schedule controller-only props.
        scheduleProps(++lastAsyncId, {
          props,
          state,
          action: (props, resolve) => {
            if (!props.cancel) {
              // Never reuse "onFrame" from a previous update.
              state.onFrame = onFrame || this.defaultProps.onFrame
              if (onFrame && props.default) {
                this.defaultProps.onFrame = onFrame
              }
            }

            // Start, replace, or cancel the async animation.
            if (asyncTo) {
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
              })
            }
          },
        })
      )
    })

    const results = await Promise.all(promises)
    return {
      value: this._get(),
      finished: results.every(result => result.finished),
    }
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

  /** Create a spring for every given key, and ensure they have `Animated` nodes. */
  protected _setSprings(keys: any[], from?: object, to?: object) {
    each(keys, key => {
      if (!this._springs[key]) {
        const spring = (this._springs[key] = new SpringValue(key))
        spring.addChild(this._onChange)
        spring.setNodeWithProps({ from, to })
      }
    })
  }

  /** Prepare an update with the given props. */
  protected _update(propsArg: ControllerProps<State>) {
    const props: PendingProps<State> = interpolateTo(propsArg) as any
    const keys = (props.keys = extractKeys(props, this._springs))

    let { from, to } = props as any

    // Avoid sending async "to" prop to springs.
    if (is.arr(to) || is.fun(to)) {
      to = undefined
    }

    // Create our springs and give them values.
    if (from || to) {
      this._setSprings(keys, from, to)
    }

    return props
  }

  /** @internal Attached as an observer to every spring */
  protected _onChange(value: any, spring: AnimationValue) {
    if (this._state.onFrame) {
      this.frame[spring.key as keyof State] = value
      G.frameLoop.onFrame(this._onFrame)
    }
  }

  /** @internal Called at the end of every animation frame */
  private _onFrame() {
    if (Object.keys(this.frame).length) {
      this._state.onFrame!(this.frame)
      this.frame = {}
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
