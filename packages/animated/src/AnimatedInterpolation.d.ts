import {
  Animatable,
  SpringValue,
  Interpolatable,
  InterpolatorArgs,
  Interpolator,
} from 'shared'
import { Animated, AnimatedArray } from './Animated'
/** Wrap each element type of `T` with the `Animated` type */
declare type AnimatedInputs<T extends Interpolatable> = {
  [P in keyof T]: Animated<T[P]>
}
export declare class AnimatedInterpolation<
  In extends Interpolatable = Interpolatable,
  Out extends Animatable = Animatable
> extends AnimatedArray<AnimatedInputs<In>> implements SpringValue<Out> {
  calc: Interpolator<In>
  constructor(
    parents: SpringValue | ReadonlyArray<SpringValue>,
    args: InterpolatorArgs<In, Out>
  )
  getValue(): Out
  interpolate<T extends Animatable>(
    ...args: InterpolatorArgs<Out, T>
  ): SpringValue<T>
}
export {}
