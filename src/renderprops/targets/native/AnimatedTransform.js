import Animated from '../../animated/Animated'
import AnimatedWithChildren from '../../animated/AnimatedWithChildren'

export default class AnimatedTransform extends AnimatedWithChildren {
  constructor(transforms) {
    super()
    this._transforms = transforms
  }

  getValue() {
    return this._transforms.map(transform => {
      var result = {}
      for (var key in transform) {
        var value = transform[key]
        result[key] = value instanceof Animated ? value.getValue() : value
      }
      return result
    })
  }

  getAnimatedValue() {
    return this._transforms.map(transform => {
      var result = {}
      for (var key in transform) {
        var value = transform[key]
        result[key] =
          value instanceof Animated ? value.getAnimatedValue() : value
      }
      return result
    })
  }

  attach() {
    this._transforms.forEach(transform => {
      for (var key in transform) {
        var value = transform[key]
        if (value instanceof Animated) value.addChild(this)
      }
    })
  }

  detach() {
    this._transforms.forEach(transform => {
      for (var key in transform) {
        var value = transform[key]
        if (value instanceof Animated) value.removeChild(this)
      }
    })
  }
}
