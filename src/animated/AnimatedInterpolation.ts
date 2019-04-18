import { SpringValue, Interpolator } from '../types/animated'
import { InterpolationConfig } from '../types/interpolation'
import Animated, { AnimatedArray } from './Animated'
import createInterpolator from './createInterpolator'

export default class AnimatedInterpolation extends AnimatedArray<Animated>
  implements SpringValue {
  calc: Interpolator<any[]>

  constructor(
    parents: Animated | Animated[],
    range: number[] | InterpolationConfig | Interpolator,
    output?: (number | string)[]
  ) {
    super()
    this.calc = createInterpolator(range as any, output)
    this.payload =
      parents instanceof AnimatedArray &&
      !(parents instanceof AnimatedInterpolation)
        ? (parents.getPayload() as Animated[])
        : Array.isArray(parents)
        ? parents
        : [parents]
  }

  public getValue() {
    return this.calc(...this.payload.map(value => value.getValue()))
  }

  public interpolate(
    range: number[] | InterpolationConfig | Interpolator,
    output?: (number | string)[]
  ): AnimatedInterpolation {
    return new AnimatedInterpolation(this, range, output)
  }
}
