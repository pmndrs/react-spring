import AnimatedInterpolation from './AnimatedInterpolation'
import AnimatedValue from './AnimatedValue'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import { InterpolationConfig } from './Interpolation'

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

  interpolate = (config: InterpolationConfig, arg: any) =>
    new AnimatedInterpolation(this, config, arg)
}
