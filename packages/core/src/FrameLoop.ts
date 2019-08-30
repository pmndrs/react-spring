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
        if (this.idle) {
          return false
        }

        // Update the animations.
        const updates: FrameUpdate[] = []
        for (const id of Array.from(this.controllers.keys())) {
          let idle = true
          const ctrl = this.controllers.get(id)!
          const changes: FrameUpdate[2] = ctrl.props.onFrame ? [] : null
          for (const config of ctrl.configs) {
            if (config.idle) continue
            if (this.advance(config, changes)) {
              idle = false
            }
          }
          if (idle || changes) {
            updates.push([id, idle, changes])
          }
        }

        // Notify the controllers!
        this.onFrame(updates)

        // Are we done yet?
        if (!this.controllers.size) {
          return !(this.idle = true)
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
      this.requestFrame(this.update)
    }
  }

  stop(ctrl: Controller) {
    this.controllers.delete(ctrl.id)
  }

  /** Advance an animation forward one frame. */
  advance(config: ActiveAnimation, changes: FrameUpdate[2]): boolean {
    const time = G.now()

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

      const startTime = animated.startTime!
      const lastTime = animated.lastTime !== void 0 ? animated.lastTime : time

      let deltaTime = time - lastTime

      // http://gafferongames.com/game-physics/fix-your-timestep/
      if (deltaTime > 64) {
        deltaTime = 64
      }

      animated.elapsedTime! += deltaTime

      const v0 = Array.isArray(config.initialVelocity)
        ? config.initialVelocity[i]
        : config.initialVelocity

      let finished = false
      let position = animated.lastPosition

      let velocity: number

      // Duration easing
      if (config.duration !== void 0) {
        position =
          from +
          config.easing!(animated.elapsedTime! / config.duration) * (to - from)

        velocity = (position - animated.lastPosition) / deltaTime

        finished = time >= startTime + config.duration
      }
      // Decay easing
      else if (config.decay) {
        const decay = config.decay === true ? 0.998 : config.decay
        const e = Math.exp(-(1 - decay) * animated.elapsedTime!)

        position = from + (v0 / (1 - decay)) * (1 - e)
        // derivative of position
        velocity = v0 * e

        finished = Math.abs(animated.lastPosition - position) < 0.1
        if (finished) to = position
      }
      // Spring easing
      else {
        velocity = animated.lastVelocity !== void 0 ? animated.lastVelocity : v0

        const w0 = Math.sqrt(config.tension! / config.mass!)

        const dt = 100 / w0
        const numSteps = Math.ceil(deltaTime / dt)

        for (let n = 0; n < numSteps; ++n) {
          const springForce = -config.tension! * (position - to)
          const dampingForce = -config.friction! * (velocity * 1000)
          const acceleration = (springForce + dampingForce) / config.mass!
          velocity = velocity + (acceleration * dt) / (1000 * 1000)
          position = position + velocity * dt
        }

        // Conditions for stopping the spring animation
        const isBouncing = config.clamp
          ? from < to
            ? position > to && velocity > 0
            : position < to && velocity < 0
          : false

        if (isBouncing) {
          velocity =
            -velocity * (typeof config.clamp! === 'number' ? config.clamp! : 0)
        }

        const isVelocity = Math.abs(velocity) <= config.precision!
        const isDisplacement =
          config.tension !== 0
            ? Math.abs(to - position) <= config.precision!
            : true

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
      animated.lastTime = time
    }

    if (changes && changed) {
      changes.push([config.key, config.animated.getValue()])
    }

    return active
  }
}
