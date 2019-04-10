import Animated from './Animated'
import Controller from './Controller'
import { now, requestFrame, manualFrameloop } from './Globals'

let active = false
const controllers = new Set()

const update = () => {
  if (!active) return false
  let time = now()
  for (let controller of controllers) {
    let isActive = false

    for (
      let configIdx = 0;
      configIdx < controller.configs.length;
      configIdx++
    ) {
      let config = controller.configs[configIdx]
      let endOfAnimation, lastTime
      for (let valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        let animated = config.animatedValues[valIdx]
        if (animated.done) continue

        let to = config.toValues[valIdx]
        let isAnimated = to instanceof Animated
        if (isAnimated) to = to.getValue()

        // Jump to end value for immediate animations
        if (config.immediate) {
          animated.setValue(to)
          animated.done = true
          continue
        }

        let from = config.fromValues[valIdx]

        // Break animation when string values are involved
        if (typeof from === 'string' || typeof to === 'string') {
          animated.setValue(to)
          animated.done = true
          continue
        }

        let position = animated.lastPosition
        let velocity = Array.isArray(config.initialVelocity)
          ? config.initialVelocity[valIdx]
          : config.initialVelocity

        if (config.duration !== void 0) {
          /** Duration easing */
          position =
            from +
            config.easing((time - animated.startTime) / config.duration) *
              (to - from)
          endOfAnimation = time >= animated.startTime + config.duration
        } else if (config.decay) {
          /** Decay easing */
          position =
            from +
            (velocity / (1 - 0.998)) *
              (1 - Math.exp(-(1 - 0.998) * (time - animated.startTime)))
          endOfAnimation = Math.abs(animated.lastPosition - position) < 0.1
          if (endOfAnimation) to = position
        } else {
          /** Spring easing */
          lastTime = animated.lastTime !== void 0 ? animated.lastTime : time
          velocity =
            animated.lastVelocity !== void 0
              ? animated.lastVelocity
              : config.initialVelocity

          // If we lost a lot of frames just jump to the end.
          if (time > lastTime + 64) lastTime = time
          // http://gafferongames.com/game-physics/fix-your-timestep/
          let numSteps = Math.floor(time - lastTime)
          for (let i = 0; i < numSteps; ++i) {
            let force = -config.tension * (position - to)
            let damping = -config.friction * velocity
            let acceleration = (force + damping) / config.mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          }

          // Conditions for stopping the spring animation
          let isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          let isVelocity = Math.abs(velocity) <= config.precision
          let isDisplacement =
            config.tension !== 0
              ? Math.abs(to - position) <= config.precision
              : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)
          animated.lastVelocity = velocity
          animated.lastTime = time
        }

        // Trails aren't done until their parents conclude
        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animated.value !== to) position = to
          animated.done = true
        } else isActive = true

        animated.setValue(position)
        animated.lastPosition = position
      }

      // Keep track of updated values only when necessary
      if (controller.props.onFrame) {
        controller.values[config.name] = config.animated.getValue()
      }
    }

    controller.onFrame(isActive)
  }

  // Loop over as long as there are controllers ...
  if (controllers.size) {
    if (manualFrameloop) manualFrameloop()
    else requestFrame(update)
  } else {
    active = false
  }
  return active
}

const start = (controller: Controller) => {
  controllers.add(controller)
  if (!active) {
    active = true
    if (manualFrameloop) requestFrame(manualFrameloop)
    else requestFrame(update)
  }
}

const stop = (controller: Controller) => {
  controllers.delete(controller)
}

export { start, stop, update }
