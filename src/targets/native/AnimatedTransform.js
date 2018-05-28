import Animated from '../../animated/Animated'
import AnimatedWithChildren from '../../animated/AnimatedWithChildren'

export default class AnimatedTransform extends AnimatedWithChildren {
  constructor(transforms) {
    super()
    this._transforms = transforms
  }

  __getValue() {
    return this._transforms.map(transform => {
      var result = {}
      for (var key in transform) {
        var value = transform[key]
        result[key] = value instanceof Animated ? value.__getValue() : value
      }
      return result
    })
  }

  __getAnimatedValue() {
    return this._transforms.map(transform => {
      var result = {}
      for (var key in transform) {
        var value = transform[key]
        result[key] =
          value instanceof Animated ? value.__getAnimatedValue() : value
      }
      return result
    })
  }

  __attach() {
    this._transforms.forEach(transform => {
      for (var key in transform) {
        var value = transform[key]
        if (value instanceof Animated) value.__addChild(this)
      }
    })
  }

  __detach() {
    this._transforms.forEach(transform => {
      for (var key in transform) {
        var value = transform[key]
        if (value instanceof Animated) value.__removeChild(this)
      }
    })
  }
}
