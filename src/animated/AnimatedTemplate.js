import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'

export default class AnimatedTemplate extends AnimatedWithChildren {
  constructor(strings, values) {
    super()
    this._strings = strings
    this._values = values

    console.warn(
      'OBSOLETE: templates in react-spring will be superceded by interpolators in the next minor, so that template`${radius}deg` becomes: radius.interpolate(r => `${r}deg` or for multiple values: interpolate([x,y,z], (x,y,z) => `${x}px,${y}px,${z}px`)'
    )
  }

  __transformValue(value) {
    if (value instanceof Animated) return value.__getValue()
    else return value
  }

  __getValue() {
    let value = this._strings[0]
    for (let i = 0; i < this._values.length; ++i)
      value += this.__transformValue(this._values[i]) + this._strings[1 + i]
    return value
  }

  __attach() {
    for (let i = 0; i < this._values.length; ++i)
      if (this._values[i] instanceof Animated) this._values[i].__addChild(this)
  }

  __detach() {
    for (let i = 0; i < this._values.length; ++i)
      if (this._values[i] instanceof Animated)
        this._values[i].__removeChild(this)
  }
}
