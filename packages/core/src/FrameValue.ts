import {
  deprecateInterpolate,
  frameLoop,
  FluidValue,
  Globals as G,
  callFluidObservers,
} from '@react-spring/shared'
import { InterpolatorArgs } from '@react-spring/types'
import { getAnimated } from '@react-spring/animated'

import { Interpolation } from './Interpolation'

export const isFrameValue = (value: any): value is FrameValue =>
  value instanceof FrameValue

let nextId = 1

/**
 * A kind of `FluidValue` that manages an `AnimatedValue` node.
 *
 * Its underlying value can be accessed and even observed.
 */
export abstract class FrameValue<T = any> extends FluidValue<
  T,
  FrameValue.Event<T>
> {
  readonly id = nextId++

  abstract key?: string
  abstract get idle(): boolean

  protected _priority = 0

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

  protected observerAdded(count: number) {
    if (count == 1) this._attach()
  }

  protected observerRemoved(count: number) {
    if (count == 0) this._detach()
  }

  /** @internal */
  abstract advance(dt: number): void

  /** @internal */
  abstract eventObserved(_event: FrameValue.Event): void

  /** Called when the first child is added. */
  protected _attach() {}

  /** Called when the last child is removed. */
  protected _detach() {}

  /** Tell our children about our new value */
  protected _onChange(value: T, idle = false) {
    callFluidObservers(this, {
      type: 'change',
      parent: this,
      value,
      idle,
    })
  }

  /** Tell our children about our new priority */
  protected _onPriorityChange(priority: number) {
    if (!this.idle) {
      frameLoop.sort(this)
    }
    callFluidObservers(this, {
      type: 'priority',
      parent: this,
      priority,
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

  /** A parent is done animating */
  interface IdleEvent<T = any> {
    parent: FrameValue<T>
    type: 'idle'
  }

  /** Events sent to children of `FrameValue` objects */
  export type Event<T = any> = ChangeEvent<T> | PriorityEvent<T> | IdleEvent<T>
}
