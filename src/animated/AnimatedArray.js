import Animated from './Animated'
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

  setValue = values =>
    values.length === this.payload.length &&
    values.forEach((v, i) => this.payload[i].setValue(v))
  getValue = () => this.payload.map(v => v.getValue())
  interpolate = (config, arg) => new AnimatedInterpolation(this, config, arg)
}
