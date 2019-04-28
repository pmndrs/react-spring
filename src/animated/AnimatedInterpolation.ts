import { Animatable, SpringValue } from '../types/animated'
import {
  Interpolatable,
  InterpolatorArgs,
  Interpolator,
} from '../types/interpolation'
import { Animated, AnimatedArray } from './Animated'
import { AnimatedValueArray } from './AnimatedValueArray'
import { createInterpolator } from './createInterpolator'
import { Arrify } from '../types/common'

/** Interpolation method for `SpringValue` types */
export type InterpolateMethod<In extends Animatable = Animatable> = <
  Out extends Animatable = Animatable
>(
  this: SpringValue,
  ...args: InterpolatorArgs<Arrify<In>, Out>
) => AnimatedInterpolation<Arrify<In>, Out>

/** Wrap a `SpringValue` with an `AnimatedInterpolation` instance */
export const interpolate: InterpolateMethod = function(...args) {
  return new AnimatedInterpolation(this, ...args)
}

/** Wrap each element type of `T` with the `Animated` type */
type AnimatedInputs<T extends Interpolatable> = {
  [P in keyof T]: Animated<T[P]>
}

export class AnimatedInterpolation<
  In extends Interpolatable = Interpolatable,
  Out extends Animatable = Animatable
> extends AnimatedArray<AnimatedInputs<In>> {
  public calc: Interpolator<In>

  readonly interpolate = interpolate as InterpolateMethod<Out>

  constructor(
    parents: SpringValue | ReadonlyArray<SpringValue>,
    ...args: InterpolatorArgs<In, Out>
  ) {
    super()
    this.calc = createInterpolator(...(args as [any]))
    this.payload = Array.isArray(parents)
      ? parents
      : parents instanceof AnimatedValueArray
      ? parents.getPayload()
      : [parents]
  }

  public getValue(): Out {
    const args = this.payload.map(value => value.getValue())
    return this.calc(...(args as [any])) as any
  }
}
