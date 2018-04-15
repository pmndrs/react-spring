import Animation from '../animated/Animation'
import Easing from './Easing'

const easeInOut = Easing.inOut(Easing.ease)
let TimingAnimation = class TimingAnimation extends Animation {
  constructor(config) {
    super()
    this._toValue = config.toValue
    this._easing = config.easing !== undefined ? config.easing : easeInOut
    this._duration = config.duration !== undefined ? config.duration : 500
    this._delay = config.delay !== undefined ? config.delay : 0
  }

  start(fromValue, onUpdate, onEnd) {
    this.__active = true
    this._fromValue = fromValue
    this._onUpdate = onUpdate
    this.__onEnd = onEnd

    const start = () => {
      if (this._duration === 0) {
        this._onUpdate(this._toValue)
        this.__debouncedOnEnd({ finished: true })
      } else {
        this._startTime = Date.now()
        this._animationFrame = requestAnimationFrame(this.onUpdate)
      }
    }

    if (this._delay) this._timeout = setTimeout(start, this._delay)
    else start()
  }

  onUpdate = () => {
    const now = Date.now()
    if (now >= this._startTime + this._duration) {
      this._onUpdate(
        this._duration === 0
          ? this._toValue
          : this._fromValue +
            this._easing(1) * (this._toValue - this._fromValue)
      )
      this.__debouncedOnEnd({ finished: true })
      return
    }
    this._onUpdate(
      this._fromValue +
        this._easing((now - this._startTime) / this._duration) *
          (this._toValue - this._fromValue)
    )
    if (this.__active)
      this._animationFrame = requestAnimationFrame(this.onUpdate)
  }

  stop() {
    this.__active = false
    clearTimeout(this._timeout)
    cancelAnimationFrame(this._animationFrame)
    this.__debouncedOnEnd({ finished: false })
  }
}
export default TimingAnimation
