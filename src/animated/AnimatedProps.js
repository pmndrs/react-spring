import Animated from './Animated'
import AnimatedStyle from './AnimatedStyle'

export default class AnimatedProps extends Animated {
  constructor(props, callback) {
    super()
    if (props.style) {
      props = {
        ...props,
        style: new AnimatedStyle(props.style),
      }
    }
    this._props = props
    this._callback = callback
    this.__attach()
  }

  __getValue() {
    const props = {}
    for (const key in this._props) {
      const value = this._props[key]
      if (value instanceof Animated) props[key] = value.__getValue()
      else props[key] = value
    }
    return props
  }

  __getAnimatedValue() {
    const props = {}
    for (const key in this._props) {
      const value = this._props[key]
      if (value instanceof Animated) props[key] = value.__getAnimatedValue()
    }
    return props
  }

  __attach() {
    for (const key in this._props) {
      const value = this._props[key]
      if (value instanceof Animated) value.__addChild(this)
    }
  }

  __detach() {
    for (const key in this._props) {
      const value = this._props[key]
      if (value instanceof Animated) value.__removeChild(this)
    }
  }

  update() {
    this._callback()
  }
}
