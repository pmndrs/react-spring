import { Animated } from '@react-spring/animated'
import { now, requestAnimationFrame } from 'shared/globals'
import { Controller, FrameUpdate } from './Controller'

type FrameUpdater = (this: FrameLoop) => boolean
type FrameListener = (this: FrameLoop, updates: FrameUpdate[]) => void

export class FrameLoop {
  /**
   * On each frame, these controllers are searched for values to animate.
   *
   * To avoid calling `requestAnimationFrame`, you can add controllers directly
   * to this.
   */
  controllers: Controller[] = []
  /**
   * True when at least one value is animating.
   */
  isActive = false
  /**
   * Process the next animation frame.
   *
   * Can be passed to `requestAnimationFrame` quite nicely.
   *
   * This advances any `Controller` instances added to it with the `start` function.
   */
  update: FrameUpdater
  /**
   * This is called at the end of every frame.
   *
   * The listener is passed an array of key-value pairs for each controller that
   * was updated in the most recent frame. The indices are directly mapped to
   * the `controllers` array, so empty arrays may exist.
   */
  onFrame: FrameListener
  /**
   * The `requestAnimationFrame` function or a custom scheduler.
   */
  requestFrame: typeof requestAnimationFrame

  constructor({
    update,
    onFrame,
    requestFrame,
  }: {
    update?: FrameUpdater
    onFrame?: FrameListener
    requestFrame?: typeof requestAnimationFrame
  } = {}) {
    this.requestFrame = requestFrame || requestAnimationFrame

    this.onFrame =
      (onFrame && onFrame.bind(this)) ||
      (updates => {
        updates.forEach((entries, i) => {
          this.controllers[i].onFrame(entries)
        })
      })

    this.update =
      (update && update.bind(this)) ||
      (() => {
        if (!this.isActive) {
          return false
        }

        // Update the animations.
        const updates: FrameUpdate[] = []
        for (const controller of this.controllers) {
          let isActive = false
          type E = FrameUpdate[1] | undefined
          const entries: E = controller.props.onFrame ? [] : void 0
          for (const config of controller.configs) {
            if (this.advance(config)) {
              isActive = true
              if (entries) {
                entries.push([config.key, config.animated.getValue()])
              }
            }
          }
          updates.push([isActive, entries])
        }

        this.onFrame(updates)

        // Are we done yet?
        if (!this.controllers.length) {
          return (this.isActive = false)
        }

        // Keep going.
        this.requestFrame(this.update)
        return true
      })
  }

  start(ctrl: Controller) {
    if (!this.controllers.includes(ctrl)) {
      this.controllers.push(ctrl)
    }
    if (!this.isActive) {
      this.isActive = true
      this.requestFrame(this.update)
    }
  }

  stop(ctrl: Controller) {
    const i = this.controllers.indexOf(ctrl)
    if (i >= 0) this.controllers.splice(i, 1)
  }

  /** Advance an animation forward one frame. */
  advance(config: any): boolean {
    const time = now()
    let isActive = false
    let finished = false
    for (let i = 0; i < config.animatedValues.length; i++) {
      const animated = config.animatedValues[i]
      if (animated.done) continue

      let to = config.toValues[i]
      const isAttached = to instanceof Animated
      if (isAttached) to = to.getValue()

      // Jump to end value for immediate animations
      if (config.immediate) {
        animated.setValue(to)
        animated.done = true
        continue
      }

      const from = config.fromValues[i]

      // Break animation when string values are involved
      if (typeof from === 'string' || typeof to === 'string') {
        animated.setValue(to)
        animated.done = true
        continue
      }

      let position = animated.lastPosition
      let velocity = Array.isArray(config.initialVelocity)
        ? config.initialVelocity[i]
        : config.initialVelocity

      // Duration easing
      if (config.duration !== void 0) {
        position =
          from +
          config.easing((time - animated.startTime) / config.duration) *
            (to - from)

        finished = time >= animated.startTime + config.duration
      }
      // Decay easing
      else if (config.decay) {
        const decay = config.decay === true ? 0.998 : config.decay
        position =
          from +
          (velocity / (1 - decay)) *
            (1 - Math.exp(-(1 - decay) * (time - animated.startTime)))

        finished = Math.abs(animated.lastPosition - position) < 0.1
        if (finished) to = position
      }
      // Spring easing
      else {
        let lastTime = animated.lastTime !== void 0 ? animated.lastTime : time
        if (animated.lastVelocity !== void 0) {
          velocity = animated.lastVelocity
        }

        // If we lost a lot of frames just jump to the end.
        if (time > lastTime + 64) lastTime = time
        // http://gafferongames.com/game-physics/fix-your-timestep/
        const numSteps = Math.floor(time - lastTime)
        for (let n = 0; n < numSteps; ++n) {
          const force = -config.tension * (position - to)
          const damping = -config.friction * velocity
          const acceleration = (force + damping) / config.mass
          velocity = velocity + (acceleration * 1) / 1000
          position = position + (velocity * 1) / 1000
        }

        animated.lastTime = time
        animated.lastVelocity = velocity

        // Conditions for stopping the spring animation
        const isOvershooting =
          config.clamp && config.tension !== 0
            ? from < to
              ? position > to
              : position < to
            : false
        const isVelocity = Math.abs(velocity) <= config.precision
        const isDisplacement =
          config.tension !== 0
            ? Math.abs(to - position) <= config.precision
            : true

        finished = isOvershooting || (isVelocity && isDisplacement)
      }

      // Trails aren't done until their parents conclude
      if (isAttached && !config.toValues[i].done) {
        finished = false
      }

      if (finished) {
        // Ensure that we end up with a round value
        if (animated.value !== to) position = to
        animated.done = true
      } else {
        isActive = true
      }

      animated.setValue(position)
      animated.lastPosition = position
    }
    return isActive
  }
}
