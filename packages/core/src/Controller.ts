import {
  is,
  each,
  OneOrMore,
  toArray,
  UnknownProps,
  UnknownPartial,
  AnyKey,
} from 'shared'
import * as G from 'shared/globals'

import { SpringProps, FluidProps } from './types/spring'
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
  UnknownPartial<FluidProps<State>> &
  AnimationEvents<unknown>

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

  /** The spring values that manage their animations */
  springs: Indexable<SpringValue> = {}

  /** The values that changed in the last animation frame */
  frame: UnknownPartial<State> = {}

  /** The current props for the controller only */
  props: CachedProps<State> = {}

  /** Fallback values for undefined props */
  defaultProps: DefaultProps<State> = {}

  /** The queue of pending props */
  queue: PendingProps<State>[] = []

  constructor(props?: ControllerProps<State>) {
    this._onChange = this._onChange.bind(this)
    this._onFrame = this._onFrame.bind(this)
    if (props) {
      props.default = true
      this.update(props).start()
    }
  }

  /** Equals true when no springs are animating */
  get idle() {
    return !this.props.promise && Object.values(this.springs).every(s => s.idle)
  }

  /** Get the latest values of every spring */
  get(): State & UnknownProps {
    const values: any = {}
    each(this.springs, (spring, key) => {
      values[key] = spring.get()
    })
    return values
  }

  /** Push an update onto the queue of each value. */
  update(propsArg: ControllerProps<State> | Falsy) {
    if (!propsArg) return this

    // This returns a new object every time.
    const props: any = interpolateTo(propsArg)
    const keys = (props.keys = extractKeys(props, this.springs))

    let { from, to } = props

    // Avoid sending async "to" prop to springs.
    if (is.arr(to) || is.fun(to)) {
      to = undefined
    }

    // Ensure springs have an initial value.
    if (from || to) {
      this._update({ keys, from, to } as any)
    }

    // Use our own queue, instead of each spring's queue.
    this.queue.push(props)
    return this
  }

  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   */
  async start() {
    const queue = this.queue
    this.queue = []

    const promises: AsyncResult[] = []
    each(queue, props => {
      const { to, onFrame, keys } = props
      const asyncTo = (is.arr(to) || is.fun(to)) && to
      if (asyncTo) {
        props.to = undefined
      }
      promises.push(
        // Send updates to every affected key.
        ...keys.map(key => this.springs[key].animate(props as any)),
        // Schedule controller-only props.
        scheduleProps(++lastAsyncId, props, this.props, (props, resolve) => {
          if (!props.cancel) {
            // Never reuse "onFrame" from a previous update.
            this.props.onFrame = onFrame || this.defaultProps.onFrame
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
                this.props,
                () => this.get(),
                () => false, // TODO: add pausing to Controller
                ((props: any) => this.update(props).start()) as any,
                this.stop.bind(this) as any
              )
            )
          } else {
            resolve({
              value: 0, // This value gets ignored.
              finished: !props.cancel,
            })
          }
        })
      )
    })

    const results = await Promise.all(promises)
    return {
      value: this.get(),
      finished: results.every(result => result.finished),
    }
  }

  /** Stop one animation, some animations, or all animations */
  stop(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      each(this.springs, spring => spring.stop())
    } else {
      each(toArray(keys), key => this.springs[key].stop())
    }
  }

  /** Restart every animation. */
  reset() {
    each(this.springs, spring => spring.reset())
    // TODO: restart async "to" prop
  }

  /** Destroy every spring in this controller */
  dispose() {
    this.props.asyncTo = undefined
    each(this.springs, spring => spring.dispose())
    this.springs = {}
  }

  /** Send an update to any spring whose key exists in `props.keys` */
  protected _update(props: PendingProps<State>) {
    each(props.keys, key => {
      let spring = this.springs[key]
      if (!spring) {
        this.springs[key] = spring = new SpringValue(key)
        spring.addChild(this._onChange)
      }
      spring.update(props as any)
    })
  }

  /** @internal Attached as an observer to every spring */
  protected _onChange(value: any, spring: AnimationValue) {
    if (this.props.onFrame) {
      this.frame[spring.key as keyof State] = value
      G.frameLoop.onFrame(this._onFrame)
    }
  }

  /** @internal Called at the end of every animation frame */
  private _onFrame() {
    if (Object.keys(this.frame).length) {
      this.props.onFrame!(this.frame)
      this.frame = {}
    }
  }
}

/** Determine which keys should receive an update */
function extractKeys(props: ControllerProps, springs: Indexable<SpringValue>) {
  const keys = new Set<AnyKey>()
  const extract = (obj: Indexable) =>
    each(obj, (value, key) => {
      if (!is.und(value)) {
        keys.add(key)
      }
    })

  const { from, to } = props
  if (is.obj(to)) extract(to)
  if (from) extract(from)

  // When neither "from" or "to" have a key with a defined value,
  // return the keys for every existing spring.
  return keys.size ? Array.from(keys) : Object.keys(springs)
}
