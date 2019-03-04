import Animated from '../../animated/Animated'

type Transform = { [key: string]: string | number | Animated }

export default class AnimatedTransform extends Animated {
  _transforms: Transform[]

  constructor(transforms: Transform[]) {
    super()
    this._transforms = transforms
  }

  getValue() {
    return this._transforms.map(transform => {
      let result: { [key: string]: unknown } = {}
      for (var key in transform) {
        var value = transform[key]
        result[key] = value instanceof Animated ? value.getValue() : value
      }
      return result
    })
  }

  getAnimatedValue() {
    return this._transforms.map(transform => {
      let result: { [key: string]: unknown } = {}
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
