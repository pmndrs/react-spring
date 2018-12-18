import AnimatedValue from './AnimatedValue'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import AnimatedInterpolation from './AnimatedInterpolation'

export default class AnimatedArray extends AnimatedArrayWithChildren {
  constructor(array) {
    super()
    this.payload =
      array instanceof AnimatedArray
        ? array.payload
        : array.map(n => new AnimatedValue(n))
  }

  setValue = value => {
    //if (Array.isArray(value)) {
      if (value.length === this.payload.length)
        value.forEach((v, i) => this.payload[i].setValue(v))
    //} else this.payload.forEach((v, i) => this.payload[i].setValue(value))
  }
  getValue = () => this.payload.map(v => v.getValue())
  interpolate = (config, arg) => new AnimatedInterpolation(this, config, arg)
}
