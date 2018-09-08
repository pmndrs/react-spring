import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'
import Interpolation from './Interpolation'

export default class AnimatedInterpolation extends AnimatedWithChildren {
  constructor(parents, config) {
    super()
    this._parents = parents._values
      ? parents._values
      : Array.isArray(parents)
        ? parents
        : [parents]
    this._interpolation = Interpolation.create(config)
  }

  __getValue() {
    return this._interpolation(
      ...this._parents.map(value => value.__getValue())
    )
  }

  __attach() {
    for (let i = 0; i < this._parents.length; ++i)
      if (this._parents[i] instanceof Animated)
        this._parents[i].__addChild(this)
  }

  __detach() {
    for (let i = 0; i < this._parents.length; ++i)
      if (this._parents[i] instanceof Animated)
        this._parents[i].__removeChild(this)
  }

  __update(config) {
    this._interpolation = Interpolation.create(config)
    return this
  }

  interpolate(config) {
    return new AnimatedInterpolation(this, config)
  }
}

export const interpolate = (parents, config) =>
  new AnimatedInterpolation(parents, config)
