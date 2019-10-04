import { deprecateInterpolate } from 'shared/deprecations'
import {
  FluidValue,
  FluidObserver,
  FluidType,
  defineHidden,
  is,
  each,
  InterpolatorArgs,
} from 'shared'
import * as G from 'shared/globals'

import { AnimatedValue } from './AnimatedValue'
import { AnimatedArray } from './AnimatedArray'
import { Into } from './Into'

export const isAnimationValue = (value: any): value is AnimationValue =>
  (value && value[FluidType]) == 2

/** Called whenever an `AnimationValue` is changed */
export type OnChange<T = unknown> = (
  value: T,
  source: AnimationValue<T>
) => void

/** An object or function that observes an `AnimationValue` */
export type AnimationObserver<T = unknown> = FluidObserver<T> | OnChange<T>

let nextId = 1

/**
 * A kind of `FluidValue` that manages an `AnimatedValue` node.
 *
 * Its underlying value can be accessed and even observed.
 */
export abstract class AnimationValue<T = any>
  implements FluidValue<T>, FluidObserver {
  readonly id = nextId++

  abstract idle: boolean
  abstract node:
    | AnimatedValue<T>
    | (T extends ReadonlyArray<any> ? AnimatedArray<T> : never)
    | undefined

  protected _priority = 0
  protected _children = new Set<AnimationObserver<T>>()

  constructor(readonly key?: string) {
    defineHidden(this, FluidType, 2)
  }

  /** @internal Controls the order in which animations are updated */
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
    // The node doesn't exist until the first update, which normally isn't an
    // issue but it can be for tests.
    return this.node && (this.node.getValue() as any)
  }

  /** Create a spring that maps our value to another value */
  to<Out>(...args: InterpolatorArgs<T, Out>) {
    return G.to(this, args) as Into<T, Out>
  }

  /** @deprecated Use the `to` method instead. */
  interpolate<Out>(...args: InterpolatorArgs<T, Out>) {
    deprecateInterpolate()
    return G.to(this, args) as Into<T, Out>
  }

  toJSON() {
    // Avoid circular JSON ("animation.value" is a circular reference)
    return { id: this.id, key: this.key, constructor: this.constructor }
  }

  /** @internal */
  addChild(child: AnimationObserver<T>): void {
    if (!this._children.size) this._attach()
    this._children.add(child)
  }

  /** @internal */
  removeChild(child: AnimationObserver<T>): void {
    this._children.delete(child)
    if (!this._children.size) this._detach()
  }

  /** @internal */
  abstract onParentChange(value: T, idle: boolean, parent: FluidValue): void

  /** @internal */
  onParentPriorityChange(priority: number, _parent: FluidValue) {
    // Assume we only have one parent.
    this.priority = priority + 1
  }

  protected _attach() {}
  protected _detach() {}

  /** Notify observers of a change to our value */
  protected _onChange(value: T, idle = false) {
    // Clone "_children" so it can be safely mutated by the loop.
    for (const observer of Array.from(this._children)) {
      if (is.fun(observer)) {
        observer(value, this)
      } else {
        observer.onParentChange(value, idle, this)
      }
    }
  }

  /** Notify observers of a change to our priority */
  protected _onPriorityChange(priority: number) {
    each(this._children, observer => {
      if (!is.fun(observer)) {
        observer.onParentPriorityChange(priority, this)
      }
    })
  }

  /** Reset our node and the nodes of every descendant */
  protected _reset(goal?: T) {
    this.node!.reset(!this.idle, goal)
    each(this._children, observer => {
      if (isAnimationValue(observer)) {
        observer._reset(goal)
      }
    })
  }
}
