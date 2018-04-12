import Animation from './Animation'
import SpringConfig from './SpringConfig'

const withDefault = (value, defaultValue) => value === undefined || value === null ? defaultValue : value

export default class SpringAnimation extends Animation {
    constructor(config) {
        super()
        this._overshootClamping = withDefault(config.overshootClamping, false)
        this._restDisplacementThreshold = withDefault(config.restDisplacementThreshold, 0.001)
        this._restSpeedThreshold = withDefault(config.restSpeedThreshold, 0.001)
        this._initialVelocity = config.velocity
        this._lastVelocity = withDefault(config.velocity, 0)
        this._toValue = config.toValue
        this.__isInteraction = config.isInteraction !== undefined ? config.isInteraction : true
        var springConfig = SpringConfig.fromOrigamiTensionAndFriction(withDefault(config.tension, 40), withDefault(config.friction, 7))
        this._tension = springConfig.tension
        this._friction = springConfig.friction
    }

    start(fromValue, onUpdate, onEnd, previousAnimation) {
        this.__active = true
        this._startPosition = fromValue
        this._lastPosition = this._startPosition
        this._onUpdate = onUpdate
        this.__onEnd = onEnd
        this._lastTime = Date.now()

        if (previousAnimation instanceof SpringAnimation) {
            var internalState = previousAnimation.getInternalState()
            this._lastPosition = internalState.lastPosition
            this._lastVelocity = internalState.lastVelocity
            this._lastTime = internalState.lastTime
        }

        if (this._initialVelocity !== undefined && this._initialVelocity !== null) this._lastVelocity = this._initialVelocity

        this.onUpdate()
    }

    getInternalState() {
        return { lastPosition: this._lastPosition, lastVelocity: this._lastVelocity, lastTime: this._lastTime }
    }

    onUpdate = () => {
        var position = this._lastPosition
        var velocity = this._lastVelocity
        var tempPosition = this._lastPosition
        var tempVelocity = this._lastVelocity

        // If for some reason we lost a lot of frames (e.g. process large payload or
        // stopped in the debugger), we only advance by 4 frames worth of
        // computation and will continue on the next frame. It's better to have it
        // running at faster speed than jumping to the end.
        var MAX_STEPS = 64
        var now = Date.now()

        if (now > this._lastTime + MAX_STEPS) now = this._lastTime + MAX_STEPS

        // We are using a fixed time step and a maximum number of iterations.
        // The following post provides a lot of thoughts into how to build this
        // loop: http://gafferongames.com/game-physics/fix-your-timestep/
        var TIMESTEP_MSEC = 1
        var numSteps = Math.floor((now - this._lastTime) / TIMESTEP_MSEC)

        for (var i = 0; i < numSteps; ++i) {
            // Velocity is based on seconds instead of milliseconds
            var step = TIMESTEP_MSEC / 1000

            // This is using RK4. A good blog post to understand how it works:
            // http://gafferongames.com/game-physics/integration-basics/
            var aVelocity = velocity
            var aAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity
            var tempPosition = position + aVelocity * step / 2
            var tempVelocity = velocity + aAcceleration * step / 2
            var bVelocity = tempVelocity
            var bAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity
            tempPosition = position + bVelocity * step / 2
            tempVelocity = velocity + bAcceleration * step / 2
            var cVelocity = tempVelocity
            var cAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity
            tempPosition = position + cVelocity * step / 2
            tempVelocity = velocity + cAcceleration * step / 2
            var dVelocity = tempVelocity
            var dAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity
            tempPosition = position + cVelocity * step / 2
            tempVelocity = velocity + cAcceleration * step / 2
            var dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6
            var dvdt = (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) / 6
            position += dxdt * step
            velocity += dvdt * step
        }

        this._lastTime = now
        this._lastPosition = position
        this._lastVelocity = velocity

        this._onUpdate(position)

        // a listener might have stopped us in _onUpdate
        if (!this.__active) return

        // Conditions for stopping the spring animation
        var isOvershooting = false
        if (this._overshootClamping && this._tension !== 0) {
            if (this._startPosition < this._toValue) {
                isOvershooting = position > this._toValue
            } else {
                isOvershooting = position < this._toValue
            }
        }

        var isVelocity = Math.abs(velocity) <= this._restSpeedThreshold
        var isDisplacement = true
        if (this._tension !== 0) isDisplacement = Math.abs(this._toValue - position) <= this._restDisplacementThreshold
        if (isOvershooting || (isVelocity && isDisplacement)) {
            // Ensure that we end up with a round value
            if (this._tension !== 0) this._onUpdate(this._toValue)
            this.__debouncedOnEnd({ finished: true })
            return
        }
        this._animationFrame = requestAnimationFrame(this.onUpdate)
    }

    stop() {
        this.__active = false
        cancelAnimationFrame(this._animationFrame)
        this.__debouncedOnEnd({ finished: false })
    }
}