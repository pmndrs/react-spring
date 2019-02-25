import { SpringValue } from '../types/animated'
import { InterpolationConfig } from '../types/interpolation'
import Animated, { AnimatedArray } from './Animated'
import createInterpolator from './createInterpolator'

type IpValue = string | number | (string | number)[]
// The widest possible interpolator type, possible if interpolate() is passed
// a custom interpolation function.
type Interpolator = (...input: IpValue[]) => IpValue

export default class AnimatedInterpolation extends AnimatedArray<Animated>
  implements SpringValue {
  calc: Interpolator

  constructor(
    parents: Animated | Animated[],
    range: number[] | InterpolationConfig | Interpolator,
    output?: (number | string)[]
  ) {
    super()
    this.payload =
      parents instanceof AnimatedArray &&
      !(parents instanceof AnimatedInterpolation)
        ? (parents.getPayload() as Animated[])
        : Array.isArray(parents)
        ? parents
        : [parents]
    this.calc = createInterpolator(range as number[], output!) as Interpolator
  }

  public getValue() {
    return this.calc(...this.payload.map(value => value.getValue()))
  }

  public updateConfig(
    range: number[] | InterpolationConfig | Interpolator,
    output?: (number | string)[]
  ) {
    this.calc = createInterpolator(range as number[], output!) as Interpolator
  }

  public interpolate(
    range: number[] | InterpolationConfig | ((...args: any[]) => IpValue),
    output?: (number | string)[]
  ): AnimatedInterpolation {
    return new AnimatedInterpolation(this, range as number[], output!)
  }
}
