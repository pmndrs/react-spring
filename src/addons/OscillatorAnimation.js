/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @author https://github.com/skevy
 */

import { Animation, Globals } from 'react-spring'

const withDefault = (value, defaultValue) =>
  value === undefined || value === null ? defaultValue : value
const stiffnessFromOrigamiValue = oValue => (oValue - 30) * 3.62 + 194
const dampingFromOrigamiValue = oValue => (oValue - 8) * 3 + 25
const fromOrigamiTensionAndFriction = (tension, friction) => ({
  stiffness: stiffnessFromOrigamiValue(tension),
  damping: dampingFromOrigamiValue(friction),
})

export default class OscillatorAnimation extends Animation {
  constructor(config) {
    super()
    this._overshootClamping = withDefault(config.overshootClamping, false)
    this._restDisplacementThreshold = withDefault(
      config.restDisplacementThreshold,
      0.0001
    )
    this._restSpeedThreshold = withDefault(config.restSpeedThreshold, 0.0001)
    this._initialVelocity = withDefault(config.velocity, 0)
    this._lastVelocity = withDefault(config.velocity, 0)
    this._to = config.to
    var springConfig = fromOrigamiTensionAndFriction(
      withDefault(config.tension, 40),
      withDefault(config.friction, 7)
    )
    this._stiffness = springConfig.stiffness
    this._damping = springConfig.damping
    this._mass = withDefault(config.mass, 1)
  }

  start(fromValue, onUpdate, onEnd, previousAnimation) {
    this.__active = true
    this._startPosition = fromValue
    this._lastPosition = this._startPosition
    this._onUpdate = onUpdate
    this.__onEnd = onEnd
    this._lastTime = Date.now()
    this._frameTime = 0.0

    if (previousAnimation instanceof OscillatorAnimation) {
      var internalState = previousAnimation.getInternalState()
      this._lastPosition = internalState.lastPosition
      this._lastVelocity = internalState.lastVelocity
      this._initialVelocity = this._lastVelocity
      this._lastTime = internalState.lastTime
    }

    if (this._initialVelocity !== undefined && this._initialVelocity !== null)
      this._lastVelocity = this._initialVelocity

    this.onUpdate()
  }

  getInternalState() {
    return {
      lastPosition: this._lastPosition,
      lastVelocity: this._lastVelocity,
      lastTime: this._lastTime,
    }
  }

  onUpdate = () => {
    // If for some reason we lost a lot of frames (e.g. process large payload or
    // stopped in the debugger), we only advance by 4 frames worth of
    // computation and will continue on the next frame. It's better to have it
    // running at faster speed than jumping to the end.
    const MAX_STEPS = 64
    let now = Date.now()
    if (now > this._lastTime + MAX_STEPS) {
      now = this._lastTime + MAX_STEPS
    }

    const deltaTime = (now - this._lastTime) / 1000
    this._frameTime += deltaTime

    const c = this._damping
    const m = this._mass
    const k = this._stiffness
    const v0 = -this._initialVelocity

    const zeta = c / (2 * Math.sqrt(k * m)) // damping ratio
    const omega0 = Math.sqrt(k / m) // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta) // exponential decay
    const x0 = this._to - this._startPosition // calculate the oscillation from x0 = 1 to x = 0

    let position = 0.0
    let velocity = 0.0
    const t = this._frameTime
    if (zeta < 1) {
      // Under damped
      const envelope = Math.exp(-zeta * omega0 * t)
      position =
        this._to -
        envelope *
          (((v0 + zeta * omega0 * x0) / omega1) * Math.sin(omega1 * t) +
            x0 * Math.cos(omega1 * t))
      // This looks crazy -- it's actually just the derivative of the
      // oscillation function
      velocity =
        zeta *
          omega0 *
          envelope *
          ((Math.sin(omega1 * t) * (v0 + zeta * omega0 * x0)) / omega1 +
            x0 * Math.cos(omega1 * t)) -
        envelope *
          (Math.cos(omega1 * t) * (v0 + zeta * omega0 * x0) -
            omega1 * x0 * Math.sin(omega1 * t))
    } else {
      // Critically damped
      const envelope = Math.exp(-omega0 * t)
      position = this._to - envelope * (x0 + (v0 + omega0 * x0) * t)
      velocity = envelope * (v0 * (t * omega0 - 1) + t * x0 * (omega0 * omega0))
    }

    this._lastTime = now
    this._lastPosition = position
    this._lastVelocity = velocity

    // Conditions for stopping the spring animation
    let isOvershooting = false
    if (this._overshootClamping && this._stiffness !== 0) {
      isOvershooting =
        this._startPosition < this._to
          ? position > this._to
          : position < this._to
    }

    this._onUpdate(isOvershooting ? this._to : position)

    // a listener might have stopped us in _onUpdate
    if (!this.__active) return

    const isVelocity = Math.abs(velocity) <= this._restSpeedThreshold
    let isDisplacement = true
    if (this._stiffness !== 0) {
      isDisplacement =
        Math.abs(this._to - position) <= this._restDisplacementThreshold
    }

    if (isOvershooting || (isVelocity && isDisplacement)) {
      if (this._stiffness !== 0) {
        // Ensure that we end up with a round value
        this._lastPosition = this._to
        this._lastVelocity = 0
        this._onUpdate(this._to)
      }
      return this.__debouncedOnEnd({ finished: true })
    }
    this._animationFrame = Globals.requestFrame(this.onUpdate)
  }

  stop() {
    this.__active = false
    clearTimeout(this._timeout)
    Globals.cancelFrame(this._animationFrame)
    this.__debouncedOnEnd({ finished: false })
  }
}
