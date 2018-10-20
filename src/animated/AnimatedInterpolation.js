import Animated from './Animated'
import AnimatedArray from './AnimatedArray'
import { AnimatedArrayWithChildren } from './AnimatedWithChildren'
import Interpolation from './Interpolation'

export default class AnimatedInterpolation extends AnimatedArrayWithChildren {
  constructor(parents, config) {
    super()
    this.payload =
      parent instanceof AnimatedArray
        ? parents.payload
        : Array.isArray(parents)
          ? parents
          : [parents]
    this.interpolation = Interpolation.create(config)
  }

  getValue = () =>
    this.interpolation(...this.payload.map(value => value.getValue()))
  updateConfig = config => (this.interpolation = Interpolation.create(config))
  interpolate = config => new AnimatedInterpolation(this, config)
}

export const interpolate = (parents, config) =>
  parents && new AnimatedInterpolation(parents, config)
