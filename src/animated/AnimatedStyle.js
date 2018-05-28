import * as Globals from './Globals'
import Animated from './Animated'
import AnimatedWithChildren from './AnimatedWithChildren'

export default class AnimatedStyle extends AnimatedWithChildren {
  constructor(style) {
    super()
    style = style || {}
    if (style.transform && !(style.transform instanceof Animated))
      style = Globals.applyAnimatedValues.transform(style)
    this._style = style
  }

  __getValue() {
    const style = {}
    for (const key in this._style) {
      const value = this._style[key]
      style[key] = value instanceof Animated ? value.__getValue() : value
    }
    return style
  }

  __getAnimatedValue() {
    const style = {}
    for (const key in this._style) {
      const value = this._style[key]
      if (value instanceof Animated) style[key] = value.__getAnimatedValue()
    }
    return style
  }

  __attach() {
    for (const key in this._style) {
      const value = this._style[key]
      if (value instanceof Animated) value.__addChild(this)
    }
  }

  __detach() {
    for (const key in this._style) {
      const value = this._style[key]
      if (value instanceof Animated) value.__removeChild(this)
    }
  }
}
