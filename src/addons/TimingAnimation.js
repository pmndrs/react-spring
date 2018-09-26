/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import { Animation, Globals } from 'react-spring'
import Easing from './Easing'

const easeInOut = Easing.inOut(Easing.ease)
let TimingAnimation = class TimingAnimation extends Animation {
  constructor(config) {
    super()
    this._to = config.to
    this._easing = config.easing !== undefined ? config.easing : easeInOut
    this._duration = config.duration !== undefined ? config.duration : 500
    this._delay = config.delay !== undefined ? config.delay : 0
  }

  start(fromValue, onUpdate, onEnd) {
    this.__active = true
    this._fromValue = fromValue
    this._onUpdate = onUpdate
    this.__onEnd = onEnd

    if (this._delay > 0) {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = undefined
      }
      this._timer = setTimeout(this.startAsync, this._delay)
    } else this.startAsync()
  }

  startAsync = () => {
    if (this._duration === 0) {
      this._onUpdate(this._to)
      this.__debouncedOnEnd({ finished: true })
    } else {
      this._startTime = Date.now()
      this._animationFrame = Globals.requestFrame(this.onUpdate)
    }
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
    clearTimeout(this._timer)
    this._timer = undefined
    Globals.cancelFrame(this._animationFrame)
    this.__debouncedOnEnd({ finished: false })
  }
}
export default TimingAnimation
