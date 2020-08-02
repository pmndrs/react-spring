import {
  each,
  InterpolatorArgs,
  FluidValue,
  FluidObserver,
} from '@react-spring/shared'
import { getAnimated } from '@react-spring/animated'
import { deprecateInterpolate } from '@react-spring/shared/src/deprecations'
import * as G from '@react-spring/shared/src/globals'

import { Interpolation } from './Interpolation'

export const isFrameValue = (value: any): value is FrameValue =>
  value instanceof FrameValue

let nextId = 1

/**
 * A kind of `FluidValue` that manages an `AnimatedValue` node.
 *
 * Its underlying value can be accessed and even observed.
 */
export abstract class FrameValue<T = any>
  extends FluidValue<T, FrameValue.Event<T>>
  implements FluidObserver<FrameValue.Event> {
  readonly id = nextId++

  abstract key?: string
  abstract get idle(): boolean

  protected _priority = 0
  protected _children = new Set<FrameValue.Observer<T>>()

  get priority() {
    return this._priority
  }
  set priority(priority: number) {
    if (this._priority != priority) {
      this._priority = priority
      this._onPriorityChange(priority)
    }
  }

  /** Get the current value */
  get(): T {
    const node = getAnimated(this)
    return node && node.getValue()
  }

  /** Create a spring that maps our value to another value */
  to<Out>(...args: InterpolatorArgs<T, Out>) {
    return G.to(this, args) as Interpolation<T, Out>
  }

  /** @deprecated Use the `to` method instead. */
  interpolate<Out>(...args: InterpolatorArgs<T, Out>) {
    deprecateInterpolate()
    return G.to(this, args) as Interpolation<T, Out>
  }

  toJSON() {
    return this.get()
  }

  /** @internal */
  abstract advance(dt: number): void

  /** @internal */
  addChild(child: FrameValue.Observer<T>): void {
    if (!this._children.size) this._attach()
    this._children.add(child)
  }

  /** @internal */
  removeChild(child: FrameValue.Observer<T>): void {
    this._children.delete(child)
    if (!this._children.size) this._detach()
  }

  /** @internal */
  onParentChange({ type }: FrameValue.Event) {
    if (this.idle) {
      // Start animating when a parent does.
      if (type == 'start') {
        this._reset()
        this._start()
      }
    }
    // Reset our animation state when a parent does, but only when
    // our animation is active.
    else if (type == 'reset') {
      this._reset()
    }
  }

  /** Called when the first child is added. */
  protected _attach() {}

  /** Called when the last child is removed. */
  protected _detach() {}

  /**
   * Reset our animation state (eg: start values, velocity, etc)
   * and tell our children to do the same.
   *
   * This is called when our goal value is changed during (or before)
   * an animation.
   */
  protected _reset() {
    this._emit({
      type: 'reset',
      parent: this,
    })
  }

  /**
   * Start animating if possible.
   *
   * Note: Be sure to call `_reset` first, or the animation will break.
   * This method would like to call `_reset` for you, but that would
   * interfere with paused animations.
   */
  protected _start() {
    this._emit({
      type: 'start',
      parent: this,
    })
  }

  /** Tell our children about our new value */
  protected _onChange(value: T, idle = false) {
    this._emit({
      type: 'change',
      parent: this,
      value,
      idle,
    })
  }

  /** Tell our children about our new priority */
  protected _onPriorityChange(priority: number) {
    if (!this.idle) {
      // Make the frameloop aware of our new priority.
      G.frameLoop.start(this)
    }
    this._emit({
      type: 'priority',
      parent: this,
      priority,
    })
  }

  protected _emit(event: FrameValue.Event) {
    // Clone "_children" so it can be safely mutated inside the loop.
    each(Array.from(this._children), child => {
      child.onParentChange(event)
    })
  }
}

export declare namespace FrameValue {
  /** A parent changed its value */
  interface ChangeEvent<T = any> {
    parent: FrameValue<T>
    type: 'change'
    value: T
    idle: boolean
  }

  /** A parent changed its priority */
  interface PriorityEvent<T = any> {
    parent: FrameValue<T>
    type: 'priority'
    priority: number
  }

  /** A parent reset the internal state of its current animation */
  interface ResetEvent<T = any> {
    parent: FrameValue<T>
    type: 'reset'
  }

  /** A parent entered the frameloop */
  interface StartEvent<T = any> {
    parent: FrameValue<T>
    type: 'start'
  }

  /** Events sent to children of `FrameValue` objects */
  export type Event<T = any> =
    | ChangeEvent<T>
    | PriorityEvent<T>
    | ResetEvent<T>
    | StartEvent<T>

  /** An object that handles `FrameValue` events */
  export type Observer<T = any> = FluidObserver<Event<T>>
}
