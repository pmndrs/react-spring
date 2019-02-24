import { InterpolationConfig, Interpolator } from '../types/interpolation'
import { AnimatedArrayWithChildren } from './Animated'
import AnimatedInterpolation from './AnimatedInterpolation'
import AnimatedValue from './AnimatedValue'

export default class AnimatedArray extends AnimatedArrayWithChildren {
  payload: AnimatedValue[]

  constructor(array: number[]) {
    super()
    this.payload = array.map(n => new AnimatedValue(n))
  }

  setValue = (value: number[], flush = true) => {
    if (Array.isArray(value)) {
      if (value.length === this.payload.length)
        value.forEach((v, i) => this.payload[i].setValue(v, flush))
    } else
      this.payload.forEach((_v, i) => this.payload[i].setValue(value, flush))
  }

  getValue = () => this.payload.map(v => v.getValue())

  interpolate<In extends string | number, Out extends string | number>(
    range: number[] | InterpolationConfig<Out> | Interpolator<In, Out>,
    output?: Out[]
  ) {
    return new AnimatedInterpolation(this, range as number[], output!)
  }
}
