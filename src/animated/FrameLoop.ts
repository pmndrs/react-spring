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
        let animation = config.animatedValues[valIdx]

        // If an animation is done, skip, until all of them conclude
        if (animation.done) continue

        let from = config.fromValues[valIdx]
        let to = config.toValues[valIdx]
        let position = animation.lastPosition
        let isAnimated = to instanceof Animated
        let velocity = Array.isArray(config.initialVelocity)
          ? config.initialVelocity[valIdx]
          : config.initialVelocity
        if (isAnimated) to = to.getValue()

        // Conclude animation if it's either immediate, or from-values match end-state
        if (config.immediate) {
          animation.setValue(to)
          animation.done = true
          continue
        }

        // Break animation when string values are involved
        if (typeof from === 'string' || typeof to === 'string') {
          animation.setValue(to)
          animation.done = true
          continue
        }

        if (config.duration !== void 0) {
          /** Duration easing */
          position =
            from +
            config.easing((time - animation.startTime) / config.duration) *
              (to - from)
          endOfAnimation = time >= animation.startTime + config.duration
        } else if (config.decay) {
          /** Decay easing */
          position =
            from +
            (velocity / (1 - 0.998)) *
              (1 - Math.exp(-(1 - 0.998) * (time - controller.startTime)))
          endOfAnimation = Math.abs(animation.lastPosition - position) < 0.1
          if (endOfAnimation) to = position
        } else {
          /** Spring easing */
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : time
          velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
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
          animation.lastVelocity = velocity
          animation.lastTime = time
        }

        // Trails aren't done until their parents conclude
        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to
          animation.done = true
        } else isActive = true

        animation.setValue(position)
        animation.lastPosition = position
      }

      // Keep track of updated values only when necessary
      if (controller.props.onFrame)
        controller.values[config.name] = config.interpolation.getValue()
    }
    // Update callbacks in the end of the frame
    if (controller.props.onFrame) controller.props.onFrame(controller.values)

    // Either call onEnd or next frame
    if (!isActive) {
      controllers.delete(controller)
      controller.stop(true)
    }
  }

  // Loop over as long as there are controllers ...
  if (controllers.size) {
    if (manualFrameloop) manualFrameloop()
    else requestFrame(update)
  } else active = false
  return active
}

const start = (controller: Controller) => {
  if (!controllers.has(controller)) {
    controllers.add(controller)
    if (!active) {
      if (manualFrameloop) requestFrame(manualFrameloop)
      else requestFrame(update)
    }
    active = true
  }
}

const stop = (controller: Controller) => {
  if (controllers.has(controller))
    controllers.delete(controller)
}

export { start, stop, update }
