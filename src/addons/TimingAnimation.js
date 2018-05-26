import Animation from '../animated/Animation'
import * as Globals from '../animated/Globals'
import Easing from './Easing'

const easeInOut = Easing.inOut(Easing.ease)
let TimingAnimation = class TimingAnimation extends Animation {
  constructor(config) {
    super()
    this._to = config.to
    this._easing = config.easing !== undefined ? config.easing : easeInOut
    this._duration = config.duration !== undefined ? config.duration : 500
  }

  start(fromValue, onUpdate, onEnd) {
    this.__active = true
    this._fromValue = fromValue
    this._onUpdate = onUpdate
    this.__onEnd = onEnd

    const start = () => {
      if (this._duration === 0) {
        this._onUpdate(this._to)
        this.__debouncedOnEnd({ finished: true })
      } else {
        this._startTime = Date.now()
        this._animationFrame = Globals.requestFrame(this.onUpdate)
      }
    }

    start()
  }

  onUpdate = () => {
    const now = Date.now()
    if (now >= this._startTime + this._duration) {
      this._onUpdate(
        this._duration === 0
          ? this._to
          : this._fromValue + this._easing(1) * (this._to - this._fromValue)
      )
      this.__debouncedOnEnd({ finished: true })
      return
    }
    this._onUpdate(
      this._fromValue +
        this._easing((now - this._startTime) / this._duration) *
          (this._to - this._fromValue)
    )
    if (this.__active)
      this._animationFrame = Globals.requestFrame(this.onUpdate)
  }

  stop() {
    this.__active = false
    clearTimeout(this._timeout)
    Globals.cancelFrame(this._animationFrame)
    this.__debouncedOnEnd({ finished: false })
  }
}
export default TimingAnimation
