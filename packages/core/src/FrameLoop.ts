import * as G from 'shared/globals'
import { Animated } from '@react-spring/animated'
import { FrameRequestCallback } from 'shared/types'
import { Controller, FrameUpdate } from './Controller'
import { ActiveAnimation } from './types/spring'

type FrameUpdater = (this: FrameLoop, time?: number) => boolean
type FrameListener = (this: FrameLoop, updates: FrameUpdate[]) => void
type RequestFrameFn = (cb: FrameRequestCallback) => number | void

export class FrameLoop {
  /**
   * On each frame, these controllers are searched for values to animate.
   */
  controllers = new Map<number, Controller>()
  /**
   * True when no controllers are animating.
   */
  idle = true
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

  lastTime?: number

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
      ((time?: number) => {
        if (this.idle) {
          return false
        }

        time = time !== void 0 ? time : performance.now()
        this.lastTime = this.lastTime !== void 0 ? this.lastTime : time
        let dt = time - this.lastTime!

        // http://gafferongames.com/game-physics/fix-your-timestep/
        if (dt > 64) dt = 64

        if (dt > 0) {
          // Update the animations.
          const updates: FrameUpdate[] = []
          for (const id of Array.from(this.controllers.keys())) {
            let idle = true
            const ctrl = this.controllers.get(id)!
            const changes: FrameUpdate[2] = ctrl.props.onFrame ? [] : null
            for (const config of ctrl.configs) {
              if (config.idle) continue
              if (this.advance(dt, config, changes)) {
                idle = false
              }
            }
            if (idle || changes) {
              updates.push([id, idle, changes])
            }
          }

          // Notify the controllers!
          this.onFrame(updates)
          this.lastTime = time

          // Are we done yet?
          if (!this.controllers.size) {
            return !(this.idle = true)
          }
        }

        // Keep going.
        this.requestFrame(this.update)
        return true
      })
  }

  start(ctrl: Controller) {
    this.controllers.set(ctrl.id, ctrl)
    if (this.idle) {
      this.idle = false
      this.lastTime = undefined
      this.requestFrame(this.update)
    }
  }

  stop(ctrl: Controller) {
    this.controllers.delete(ctrl.id)
  }

  /** Advance an animation forward one frame. */
  advance(
    dt: number,
    config: ActiveAnimation,
    changes: FrameUpdate[2]
  ): boolean {
    let active = false
    let changed = false
    for (let i = 0; i < config.animatedValues.length; i++) {
      const animated = config.animatedValues[i]
      if (animated.done) continue
      changed = true

      let to: any = config.toValues[i]
      const target: any = to instanceof Animated ? to : null
      if (target) to = target.getValue()

      const from: any = config.fromValues[i]

      // Jump to end value for immediate animations
      if (
        config.immediate ||
        typeof from === 'string' ||
        typeof to === 'string'
      ) {
        animated.setValue(to)
        animated.done = true
        continue
      }

      const startTime = animated.startTime
      const elapsed = (animated.elapsedTime += dt)

      const v0 = Array.isArray(config.initialVelocity)
        ? config.initialVelocity[i]
        : config.initialVelocity

      const precision =
        config.precision || Math.min(1, Math.abs(to - from) * 0.001)

      let finished = false
      let position = animated.lastPosition

      let velocity: number

      // Duration easing
      if (config.duration !== void 0) {
        position =
          from + config.easing!(elapsed / config.duration) * (to - from)

        velocity = (position - animated.lastPosition) / dt

        finished = G.now() >= startTime + config.duration
      }
      // Decay easing
      else if (config.decay) {
        const decay = config.decay === true ? 0.998 : config.decay
        const e = Math.exp(-(1 - decay) * elapsed)

        position = from + (v0 / (1 - decay)) * (1 - e)
        // derivative of position
        velocity = v0 * e

        finished = Math.abs(animated.lastPosition - position) < 0.1
        if (finished) to = position
      }
      // Spring easing
      else {
        velocity = animated.lastVelocity == null ? v0 : animated.lastVelocity

        const step = 0.05 / config.w0
        const numSteps = Math.ceil(dt / step)

        for (let n = 0; n < numSteps; ++n) {
          const springForce = -config.tension! * 0.000001 * (position - to)
          const dampingForce = -config.friction! * 0.001 * velocity
          const acceleration = (springForce + dampingForce) / config.mass! // pt/ms^2
          velocity = velocity + acceleration * step // pt/ms
          position = position + velocity * step
        }

        // Conditions for stopping the spring animation
        const isBouncing =
          config.clamp !== false && config.tension !== 0
            ? from < to
              ? position > to && velocity > 0
              : position < to && velocity < 0
            : false

        if (isBouncing) {
          velocity =
            -velocity * (config.clamp === true ? 0 : (config.clamp as any))
        }

        const isVelocity = Math.abs(velocity) <= precision
        const isDisplacement =
          config.tension !== 0 ? Math.abs(to - position) <= precision : true

        finished =
          (isBouncing && velocity === 0) || (isVelocity && isDisplacement)
      }
      // Trails aren't done until their parents conclude
      if (finished && !(target && !target.done)) {
        // Ensure that we end up with a round value
        if (animated.value !== to) position = to
        animated.done = true
      } else {
        active = true
      }

      animated.setValue(position)
      animated.lastPosition = position
      animated.lastVelocity = velocity
    }

    if (changes && changed) {
      changes.push([config.key, config.animated.getValue()])
    }

    return active
  }
}
