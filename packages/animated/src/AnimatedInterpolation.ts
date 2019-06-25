import {
  createInterpolator,
  Animatable,
  SpringValue,
  Interpolatable,
  InterpolatorArgs,
  Interpolator,
} from 'shared'
import { interpolate } from './interpolate'
import { Animated, AnimatedArray } from './Animated'
import { AnimatedValue } from './AnimatedValue'
import { AnimatedValueArray } from './AnimatedValueArray'

/** Wrap each element type of `T` with the `Animated` type */
type AnimatedInputs<T extends Interpolatable> = {
  [P in keyof T]: Animated<T[P]>
}

export class AnimatedInterpolation<
  In extends Interpolatable = Interpolatable,
  Out extends Animatable = Animatable
> extends AnimatedArray<AnimatedInputs<In>> implements SpringValue<Out> {
  public calc: Interpolator<In>

  constructor(
    parents: SpringValue | readonly SpringValue[],
    args: InterpolatorArgs<In, Out>
  ) {
    super()
    this.calc = createInterpolator(...(args as [any])) as any
    this.payload = Array.isArray(parents)
      ? parents.map(AnimatedValue.from)
      : parents instanceof AnimatedValueArray
      ? parents.getPayload()
      : [parents]
  }

  public getValue(): Out {
    const args = this.payload.map(value => value.getValue())
    return this.calc(...(args as [any])) as any
  }

  public interpolate<T extends Animatable>(
    ...args: InterpolatorArgs<Out, T>
  ): SpringValue<T> {
    return interpolate(this, ...(args as [any])) as any
  }
}
