import Animated from './Animated'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import Interpolation from './Interpolation'

export default class AnimatedInterpolation extends AnimatedArrayWithChildren {
  constructor(parents, config) {
    super()
    this.payload = parents.payload
      ? parents.payload
      : Array.isArray(parents)
        ? parents
        : [parents]
    this.interpolate = Interpolation.create(config)
  }

  getValue = () =>
    this.interpolate(...this.payload.map(value => value.getValue()))
  updateConfig = config => this.interpolate = Interpolation.create(config)
  interpolate = config => new AnimatedInterpolation(this, config)
}

export const interpolate = (parents, config) =>
  parents && new AnimatedInterpolation(parents, config)
