import Animation from './Animation'
import * as Globals from './Globals'

const withDefault = (value, defaultValue) =>
  value === undefined || value === null ? defaultValue : value
const tensionFromOrigamiValue = oValue => (oValue - 30) * 3.62 + 194
const frictionFromOrigamiValue = oValue => (oValue - 8) * 3 + 25
const fromOrigamiTensionAndFriction = (tension, friction) => ({
  tension: tensionFromOrigamiValue(tension),
  friction: frictionFromOrigamiValue(friction),
})

export default class SpringAnimation extends Animation {
  constructor(config) {
    super()
    this._overshootClamping = withDefault(config.overshootClamping, false)
    this._restDisplacementThreshold = withDefault(
      config.restDisplacementThreshold,
      0.0001
    )
    this._restSpeedThreshold = withDefault(config.restSpeedThreshold, 0.0001)
    this._initialVelocity = config.velocity
    this._lastVelocity = withDefault(config.velocity, 0)
    this._to = config.to
    let springConfig = fromOrigamiTensionAndFriction(
      withDefault(config.tension, 40),
      withDefault(config.friction, 7)
    )
    this._tension = springConfig.tension
    this._friction = springConfig.friction
    this._delay = withDefault(config.delay, 0)
  }

  start(fromValue, onUpdate, onEnd, previousAnimation) {
    this.__active = true
    this._startPosition = fromValue
    this._lastPosition = this._startPosition
    this._onUpdate = onUpdate
    this.__onEnd = onEnd
    this.__previous = previousAnimation

    if (this._delay > 0) {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = undefined
      }
      this._timer = setTimeout(this.startAsync, this._delay)
    } else this.startAsync()
  }

  startAsync = () => {
    this._lastTime = Globals.now()
    if (
      typeof this._startPosition === 'string' ||
      typeof this._to === 'string'
    ) {
      this._onUpdate(this._to)
      return this.__debouncedOnEnd({ finished: true })
    }

    if (this.__previous instanceof SpringAnimation) {
      let internalState = this.__previous.getInternalState()
      this._lastPosition = internalState.lastPosition
      this._lastVelocity = internalState.lastVelocity
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
    let position = this._lastPosition
    let velocity = this._lastVelocity
    let tempPosition = this._lastPosition
    let tempVelocity = this._lastVelocity

    // If for some reason we lost a lot of frames (e.g. process large payload or
    // stopped in the debugger), we only advance by 4 frames worth of
    // computation and will continue on the next frame. It's better to have it
    // running at faster speed than jumping to the end.
    let MAX_STEPS = 64
    let now = Globals.now()

    if (now > this._lastTime + MAX_STEPS) now = this._lastTime + MAX_STEPS

    // We are using a fixed time step and a maximum number of iterations.
    // The following post provides a lot of thoughts into how to build this
    // loop: http://gafferongames.com/game-physics/fix-your-timestep/
    let TIMESTEP_MSEC = 1
    let numSteps = Math.floor((now - this._lastTime) / TIMESTEP_MSEC)

    for (let i = 0; i < numSteps; ++i) {
      // Velocity is based on seconds instead of milliseconds
      let step = TIMESTEP_MSEC / 1000

      // This is using RK4. A good blog post to understand how it works:
      // http://gafferongames.com/game-physics/integration-basics/
      let aVelocity = velocity
      let aAcceleration =
        this._tension * (this._to - tempPosition) -
        this._friction * tempVelocity
      tempPosition = position + (aVelocity * step) / 2
      tempVelocity = velocity + (aAcceleration * step) / 2
      let bVelocity = tempVelocity
      let bAcceleration =
        this._tension * (this._to - tempPosition) -
        this._friction * tempVelocity
      tempPosition = position + (bVelocity * step) / 2
      tempVelocity = velocity + (bAcceleration * step) / 2
      let cVelocity = tempVelocity
      let cAcceleration =
        this._tension * (this._to - tempPosition) -
        this._friction * tempVelocity
      tempPosition = position + (cVelocity * step) / 2
      tempVelocity = velocity + (cAcceleration * step) / 2
      let dVelocity = tempVelocity
      let dAcceleration =
        this._tension * (this._to - tempPosition) -
        this._friction * tempVelocity
      tempPosition = position + (cVelocity * step) / 2
      tempVelocity = velocity + (cAcceleration * step) / 2
      let dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6
      let dvdt =
        (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) /
        6
      position += dxdt * step
      velocity += dvdt * step
    }

    this._lastTime = now
    this._lastPosition = position
    this._lastVelocity = velocity

    // Conditions for stopping the spring animation
    let isOvershooting =
      this._overshootClamping && this._tension !== 0
        ? this._startPosition < this._to
          ? position > this._to
          : position < this._to
        : false

    let isVelocity = Math.abs(velocity) <= this._restSpeedThreshold
    let isDisplacement =
      this._tension !== 0
        ? Math.abs(this._to - position) <= this._restDisplacementThreshold
        : true
    let endOfAnimation = isOvershooting || (isVelocity && isDisplacement)

    // a listener might have stopped us in _onUpdate
    if (!this.__active) return

    if (endOfAnimation) {
      // Ensure that we end up with a round value
      if (this._tension !== 0) this._onUpdate(this._to)
      return this.__debouncedOnEnd({ finished: true })
    } else this._onUpdate(position)
    this._animationFrame = Globals.requestFrame(this.onUpdate)
  }

  stop() {
    this.__active = false
    clearTimeout(this._timeout)
    this._timeout = undefined
    Globals.cancelFrame(this._animationFrame)
    this.__debouncedOnEnd({ finished: false })
  }
}
