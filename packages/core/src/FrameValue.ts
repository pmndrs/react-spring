import { each, InterpolatorArgs, FluidValue, FluidObserver } from 'shared'
import { deprecateInterpolate } from 'shared/deprecations'
import * as G from 'shared/globals'

import { Interpolation } from './Interpolation'
import { getAnimated } from 'animated'

export const isFrameValue = (value: any): value is FrameValue =>
  value instanceof FrameValue

let nextId = 1

/**
 * A kind of `FluidValue` that manages an `AnimatedValue` node.
 *
 * Its underlying value can be accessed and even observed.
 */
export abstract class FrameValue<T = any>
  implements
    FluidValue<T, FrameValue.Event<T>>,
    FluidObserver<FrameValue.Event> {
  readonly id = nextId++

  abstract key?: string
  abstract idle: boolean

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
  onParentChange(event: FrameValue.Event) {
    if (event.type == 'reset') {
      this._reset(event.goal)
    } else if (event.type == 'start') {
      this._start()
    }
  }

  /** Called when the first child is added. */
  protected _attach() {}

  /** Called when the last child is removed. */
  protected _detach() {}

  /** Reset the animation state of this value and every descendant */
  protected _reset(goal?: T) {
    this._emit({
      type: 'reset',
      parent: this,
      goal,
    })
  }

  /** Enter the frameloop if possible */
  protected _start() {
    this._emit({
      type: 'start',
      parent: this,
    })
  }

  /** Notify observers of a change to our value */
  protected _onChange(value: T, idle = false) {
    this._emit({
      type: 'change',
      parent: this,
      value,
      idle,
    })
  }

  /** Notify observers of a change to our priority */
  protected _onPriorityChange(priority: number) {
    if (!this.idle) {
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

export namespace FrameValue {
  /** A parent changed its value */
  interface ChangeEvent<T = any> {
    type: 'change'
    value: T
    idle: boolean
  }

  /** A parent changed its priority */
  interface PriorityEvent {
    type: 'priority'
    priority: number
  }

  /** A parent reset its animation state */
  interface ResetEvent<T = any> {
    type: 'reset'
    goal: T | undefined
  }

  /** A parent entered the frameloop */
  interface StartEvent {
    type: 'start'
  }

  /** Events sent to children of `FrameValue` objects */
  export type Event<T = any> = { parent: FrameValue<T> } & (
    | ChangeEvent<T>
    | PriorityEvent
    | ResetEvent<T>
    | StartEvent)

  /** An object that handles `FrameValue` events */
  export type Observer<T = any> = FluidObserver<Event<T>>
}
