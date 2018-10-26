import Animated from './Animated'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import Interpolation from './Interpolation'

export default class AnimatedInterpolation extends AnimatedArrayWithChildren {
  constructor(parents, config, arg) {
    super()
    this.payload =
      // AnimatedArrays should unfold, except AnimatedInterpolation which is taken as is
      parents instanceof AnimatedArrayWithChildren && !parents.updateConfig
        ? parents.payload
        : Array.isArray(parents)
          ? parents
          : [parents]
    this.calc = Interpolation.create(config, arg)
  }

  getValue = () => this.calc(...this.payload.map(value => value.getValue()))
  updateConfig = (config, arg) =>
    (this.calc = Interpolation.create(config, arg))
  interpolate = (config, arg) => new AnimatedInterpolation(this, config, arg)
}

export const interpolate = (parents, config, arg) =>
  parents && new AnimatedInterpolation(parents, config, arg)
