import {
  AnimatedValueFromInterpolation,
  InterpolationConfig,
  Interpolator,
} from '../types/interpolation'
import Animated, { AnimatedArrayWithChildren } from './Animated'
import createInterpolator from './createInterpolator'

export default class AnimatedInterpolation<
  Value extends number | string = number | string
> extends AnimatedArrayWithChildren {
  calc: Interpolator<number, Value>

  constructor(
    parents: Animated | Animated[],
    range: number[] | InterpolationConfig<Value> | Interpolator<Value>,
    output?: Value[]
  ) {
    super()
    this.payload =
      // AnimatedArrays should unfold, except AnimatedInterpolation which is taken as is
      parents instanceof AnimatedArrayWithChildren &&
      !('updateConfig' in parents)
        ? parents.payload
        : Array.isArray(parents)
        ? parents
        : [parents]
    this.calc = createInterpolator(range as number[], output!)
  }

  getValue = (): Value =>
    (this.calc as any)(...this.payload.map(value => value.getValue()))

  updateConfig(
    range: number[] | InterpolationConfig<Value> | Interpolator<Value>,
    output?: Value[]
  ) {
    this.calc = createInterpolator<Value>(range as number[], output!)
  }

  interpolate<In extends string | number, Out extends string | number = In>(
    range: number[] | InterpolationConfig<Out> | Interpolator<In, Out>,
    output?: Out[]
  ) {
    return new AnimatedInterpolation(this, range as number[], output!)
  }
}

export const interpolate: AnimatedValueFromInterpolation = <
  In extends number | string,
  Out extends number | string = In
>(
  parents: Animated | Animated[],
  range: number[] | InterpolationConfig<Out> | Interpolator<In, Out>,
  output?: Out[]
) =>
  parents && new AnimatedInterpolation<Out>(parents, range as number[], output!)
