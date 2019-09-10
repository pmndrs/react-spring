import { FluidValue, FluidObserver, FluidType, defineHidden } from 'shared'
import { Animated } from './Animated'

export const isAnimationValue = (value: any): value is AnimationValue =>
  (value && value[FluidType]) == 2

let nextId = 1

/** @internal A kind of `FluidValue` that provides access to an `Animated` object, a generated identifier, and the current value */
export abstract class AnimationValue<T = any> implements FluidValue<T> {
  constructor() {
    defineHidden(this, FluidType, 2)
  }
  readonly id = nextId++
  abstract node: Animated
  abstract get(): T
  abstract addChild(child: FluidObserver): void
  abstract removeChild(child: FluidObserver): void
}
