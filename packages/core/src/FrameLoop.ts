import * as G from 'shared/globals'
import { Animated } from '@react-spring/animated'
import { FrameRequestCallback } from 'shared/types'
import { Controller, FrameUpdate } from './Controller'
import { ActiveAnimation } from './types/spring'

type FrameUpdater = (this: FrameLoop) => boolean
type FrameListener = (this: FrameLoop, updates: FrameUpdate[]) => void
type RequestFrameFn = (cb: FrameRequestCallback) => number | void

export class FrameLoop {
  /**
   * On each frame, these controllers are searched for values to animate.
   */
  controllers = new Map<number, Controller>()
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
  requestFrame: RequestFrameFn

  constructor({
    update,
    onFrame,
    requestFrame,
  }: {
    update?: FrameUpdater
    onFrame?: FrameListener
    requestFrame?: RequestFrameFn
  } = {}) {
    this.requestFrame =
      // The global `requestAnimationFrame` must be dereferenced to avoid "Illegal invocation" errors
      requestFrame || (fn => (void 0, G.requestAnimationFrame)(fn))

    this.onFrame =
      (onFrame && onFrame.bind(this)) ||
      (updates => {
        updates.forEach(update => {
          const ctrl = this.controllers.get(update[0])
          if (ctrl) ctrl.onFrame(update)
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
        for (const id of Array.from(this.controllers.keys())) {
          let isActive = false
          const ctrl = this.controllers.get(id)!
          const changes: FrameUpdate[2] = ctrl.props.onFrame && []
          for (const config of ctrl.configs) {
            if (config.idle) continue
            if (this.advance(config)) {
              isActive = true
              if (changes) {
                changes.push([config.key, config.animated.getValue()])
              }
            }
          }
          updates.push([id, isActive, changes])
        }

        // Notify the controllers!
        this.onFrame(updates)

        // Are we done yet?
        if (!this.controllers.size) {
          return (this.isActive = false)
        }

        // Keep going.
        this.requestFrame(this.update)
        return true
      })
  }

  start(ctrl: Controller) {
    this.controllers.set(ctrl.id, ctrl)
    if (!this.isActive) {
      this.isActive = true
      this.requestFrame(this.update)
    }
  }

  stop(ctrl: Controller) {
    this.controllers.delete(ctrl.id)
  }

  /** Advance an animation forward one frame. */
  advance(config: ActiveAnimation): boolean {
    const time = G.now()
    let isActive = false
    let finished = false
    for (let i = 0; i < config.animatedValues.length; i++) {
      const animated = config.animatedValues[i]
      if (animated.done) continue

      let to: any = config.toValues[i]
      const target: any = to instanceof Animated ? to : null
      if (target) to = target.getValue()

      // Jump to end value for immediate animations
      if (config.immediate) {
        animated.setValue(to)
        animated.done = true
        continue
      }

      const from: any = config.fromValues[i]
      const startTime = animated.startTime!

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
          config.easing!((time - startTime) / config.duration) * (to - from)

        finished = time >= startTime + config.duration
      }
      // Decay easing
      else if (config.decay) {
        const decay = config.decay === true ? 0.998 : config.decay
        position =
          from +
          (velocity / (1 - decay)) *
            (1 - Math.exp(-(1 - decay) * (time - startTime)))

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
          const force = -config.tension! * (position - to)
          const damping = -config.friction! * velocity
          const acceleration = (force + damping) / config.mass!
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
        const isVelocity = Math.abs(velocity) <= config.precision!
        const isDisplacement =
          config.tension !== 0
            ? Math.abs(to - position) <= config.precision!
            : true

        finished = isOvershooting || (isVelocity && isDisplacement)
      }

      // Trails aren't done until their parents conclude
      if (target && !target.done) {
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
