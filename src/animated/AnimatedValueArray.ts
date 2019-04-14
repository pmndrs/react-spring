import { SpringValue } from '../types/animated'
import { InterpolationConfig } from '../types/interpolation'
import { AnimatedArray } from './Animated'
import AnimatedInterpolation from './AnimatedInterpolation'
import AnimatedValue from './AnimatedValue'

export default class AnimatedValueArray extends AnimatedArray<AnimatedValue>
  implements SpringValue {
  constructor(values: AnimatedValue[]) {
    super()
    this.payload = values
  }

  public setValue(value: any, flush = true) {
    if (Array.isArray(value)) {
      if (value.length === this.payload.length) {
        value.forEach((v, i) => this.payload[i].setValue(v, flush))
      }
    } else {
      this.payload.forEach(p => p.setValue(value, flush))
    }
  }

  public getValue() {
    return this.payload.map(v => v.getValue())
  }

  public interpolate(
    range: number[] | InterpolationConfig | ((...args: any[]) => any),
    output?: (number | string)[]
  ): AnimatedInterpolation {
    return new AnimatedInterpolation(this, range as number[], output)
  }
}
