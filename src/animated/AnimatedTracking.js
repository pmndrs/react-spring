import Animated from './Animated'

export default class AnimatedTracking extends Animated {
  constructor(value, parent, animationClass, animationConfig, callback) {
    super()
    this._value = value
    this._parent = parent
    this._animationClass = animationClass
    this._animationConfig = animationConfig
    this._callback = callback
    this.__attach()
  }

  __getValue() {
    return this._parent.__getValue()
  }

  __attach() {
    this._parent.__addChild(this)
  }

  __detach() {
    this._parent.__removeChild(this)
  }

  update = throttle(() => {
    this._value.animate(
      new this._animationClass({
        ...this._animationConfig,
        to: this._animationConfig.to.__getValue(),
      }),
      this._callback
    )
  }, 1000 / 30)
}

function throttle(func, wait) {
  let timeout = null
  let previous = 0
  let later = () => func((previous = Date.now()), (timeout = null))
  return function() {
    let now = Date.now()
    let remaining = wait - (now - previous)
    if (remaining <= 0 || remaining > wait) {
      if (timeout) void (clearTimeout(timeout), (timeout = null))
      func((previous = now))
    } else if (!timeout) timeout = setTimeout(later, remaining)
  }
}
