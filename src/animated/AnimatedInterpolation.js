import Animated from './Animated'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import Interpolation from './Interpolation'

export default class AnimatedInterpolation extends AnimatedArrayWithChildren {
  constructor(parents, config) {
    super()
    this.payload =
      // AnimatedArrays should unfold, except AnimatedInterpolation which is taken as is
      parents instanceof AnimatedArrayWithChildren && !parents.updateConfig
        ? parents.payload
        : Array.isArray(parents)
          ? parents
          : [parents]
    this.calc = Interpolation.create(config)
  }

  getValue = () => this.calc(...this.payload.map(value => value.getValue()))
  updateConfig = config => (this.calc = Interpolation.create(config))
  interpolate = config => new AnimatedInterpolation(this, config)
}

export const interpolate = (parents, config) =>
  parents && new AnimatedInterpolation(parents, config)
