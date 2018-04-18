import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'
import * as Globals from './Globals'

export default class AnimatedInterpolation extends AnimatedWithChildren {
  constructor(parents, config) {
    super()
    this._parents = Array.isArray(parents) ? parents : [parents]
    this._interpolation = Globals.Interpolation.create(config)
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

  interpolate(config) {
    return new AnimatedInterpolation(this, config)
  }
}

export const interpolate = (parents, config) =>
  new AnimatedInterpolation(parents, config)
