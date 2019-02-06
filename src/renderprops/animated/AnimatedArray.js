import AnimatedValue from './AnimatedValue'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import AnimatedInterpolation from './AnimatedInterpolation'

export default class AnimatedArray extends AnimatedArrayWithChildren {
  constructor(array) {
    super()
    this.payload = array.map(n => new AnimatedValue(n))
  }

  setValue = (value, flush = true) => {
    if (Array.isArray(value)) {
      if (value.length === this.payload.length)
        value.forEach((v, i) => this.payload[i].setValue(v, flush))
    } else
      this.payload.forEach((v, i) => this.payload[i].setValue(value, flush))
  }
  getValue = () => this.payload.map(v => v.getValue())
  interpolate = (config, arg) => new AnimatedInterpolation(this, config, arg)
}
