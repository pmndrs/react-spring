import { FrameRequestCallback } from 'shared/types'
import { isAnimationValue } from '@react-spring/animated'
import { is, isFluidValue, toArray, each } from 'shared'
import * as G from 'shared/globals'

import { SpringValue } from './SpringValue'
import invariant from 'tiny-invariant'

type FrameUpdater = (this: FrameLoop, time?: number) => boolean
type RequestFrameFn = (cb: FrameRequestCallback) => number | void

export class FrameLoop {
  /**
   * The animated springs
   */
  springs: SpringValue[] = []

  /**
   * True when at least one spring is animating.
   */
  active = false

  /**
   * The timestamp of the most recent frame.
   *
   * Equals `undefined` if nothing is animating.
   */
  lastTime?: number

  /**
   * Process the next animation frame.
   *
   * Can be passed to `requestAnimationFrame` quite nicely.
   *
   * This advances any `Controller` instances added to it with the `start` function.
   */
  update: FrameUpdater

  /** Equals true when a frame is being processed. */
  updating = false

  // These queues are swapped at the end of every frame,
  // after the current queue is drained.
  private _queues = [
    new Set<FrameRequestCallback>(),
    new Set<FrameRequestCallback>(),
  ]

  // The `requestAnimationFrame` function or a custom scheduler.
  private _requestFrame: RequestFrameFn

  constructor({
    update,
    requestFrame,
  }: {
    update?: FrameUpdater
    requestFrame?: RequestFrameFn
  } = {}) {
    this._requestFrame =
      // The global `requestAnimationFrame` must be dereferenced to avoid "Illegal invocation" errors
      requestFrame || (fn => (void 0, G.requestAnimationFrame)(fn))

    this.update =
      (update && update.bind(this)) ||
      ((time?: number) => {
        if (!this.active) {
          return false
        }

        this.updating = true

        if (is.und(time)) time = performance.now()
        let dt = is.und(this.lastTime) ? 0 : time - this.lastTime

        // http://gafferongames.com/game-physics/fix-your-timestep/
        if (dt > 64) dt = 64

        if (dt > 0) {
          // Advance the springs. Ignore mutations to the "springs" array.
          each([...this.springs], spring => {
            spring.idle || this.advance(dt, spring)
          })

          // Notify frame listeners.
          const queues = this._queues
          const queue = queues[0]
          if (queue.size) {
            // Run and clear the queue.
            queue.forEach(onFrame => onFrame())
            queue.clear()
            // Swap the queues.
            queues[0] = queues[1]
            queues[1] = queue
          }

          this.updating = false
          if (!this.springs.length) {
            this.lastTime = undefined
            return (this.active = false)
          }
        }

        this.lastTime = time
        this._requestFrame(this.update)
        return true
      })
  }

  /**
   * Schedule a function to run at the end of the current frame,
   * after all springs have been updated.
   *
   * Pass `true` as the 2nd argument to run at the end of the **next** frame.
   */
  onFrame(cb: FrameRequestCallback, next?: boolean) {
    this._queues[next && this.updating ? 1 : 0].add(cb)
    this._start()
  }

  /**
   * Start animating the given spring.
   *
   * Beware: Never `start` the same spring twice (without `stop` between).
   */
  start(spring: SpringValue) {
    const { springs } = this
    let i = springs.findIndex(s => s.priority > spring.priority)
    if (i < 0) i = springs.length
    springs.splice(i, 0, spring)
    this._start()
  }

  protected _start() {
    if (!this.active) {
      this.active = true
      this._requestFrame(this.update)
    }
  }

  /**
   * Stop animating the given spring
   */
  stop(spring: SpringValue) {
    const { springs } = this
    const i = springs.indexOf(spring)
    if (~i) springs.splice(i, 1)
    return this
  }

  /**
   * Advance an animation forward one frame.
   */
  advance(dt: number, spring: SpringValue) {
    let idle = true
    let changed = false

    const anim = spring.animation!
    const parent = isFluidValue(anim.to) && anim.to
    const payload = isAnimationValue(parent) && parent.node.getPayload()

    anim.values.forEach((node, i) => {
      if (node.done) return

      let to: number = payload
        ? payload[i].lastPosition
        : parent
        ? toArray(parent.get())[i]
        : anim.toValues![i]

      // Parent springs must finish before their children can.
      const canFinish = !payload || payload[i].done

      const { config } = anim

      // Loose springs never move.
      if (config.tension == 0) {
        node.done = true
        return
      }

      // Jump to end value for immediate animations.
      if (anim.immediate) {
        if (to !== node.lastPosition) {
          changed = true
          node.setValue(to)
        }
        node.done = canFinish
        return
      }

      const elapsed = (node.elapsedTime += dt)
      const from = anim.fromValues[i]
      const v0 = is.arr(config.velocity) ? config.velocity[i] : config.velocity

      let position = node.lastPosition
      let velocity: number
      let finished!: boolean

      // Duration easing
      if (!is.und(config.duration)) {
        let p = config.progress
        if (config.duration <= 0) p = 1
        else p += (1 - p) * Math.min(1, elapsed / config.duration)

        position = from + config.easing(p) * (to - from)
        velocity = (position - node.lastPosition) / dt

        finished = p == 1
      }

      // Decay easing
      else if (config.decay) {
        const decay = config.decay === true ? 0.998 : config.decay
        const e = Math.exp(-(1 - decay) * elapsed)

        position = from + (v0 / (1 - decay)) * (1 - e)
        // derivative of position
        velocity = v0 * e

        finished = Math.abs(node.lastPosition - position) < 0.1
        if (finished) to = position
      }

      // Spring easing
      else {
        velocity = node.lastVelocity == null ? v0 : node.lastVelocity
        if (node.v0 == null) {
          node.v0 = v0
        }

        /**
         * Coefficient of restitution.
         *
         * Set to zero to stop the animation at its end value.
         * Set to a positive number to multiply the inverted velocity of a bounce animation.
         */
        const clamp =
          config.clamp !== false
            ? config.clamp === true
              ? 0
              : config.clamp!
            : -1

        /** The smallest distance from a value before being treated like said value. */
        const precision =
          config.precision ||
          (from == to ? 0.005 : Math.min(1, Math.abs(to - from) * 0.001))

        /** The velocity at which movement is essentially none */
        const restVelocity = config.restVelocity || precision

        /** Equals true when the velocity is considered moving */
        let isMoving!: boolean

        /** Equals true when the velocity is being deflected or clamped */
        let isBouncing!: boolean

        const step = 0.05 / config.w0
        const numSteps = Math.ceil(dt / step)
        for (let n = 0; n < numSteps; ++n) {
          isMoving = Math.abs(velocity) > restVelocity

          if (!isMoving) {
            finished = Math.abs(to - position) <= precision
            if (finished) {
              break
            }
          }

          isBouncing =
            clamp >= 0 &&
            (position == to ||
              position > to == (from == to ? node.v0 > 0 : from > to))

          // Invert the velocity with a magnitude, or clamp it.
          if (isBouncing) {
            velocity = clamp * -velocity
            position = to
          }

          const springForce = -config.tension * 0.000001 * (position - to)
          const dampingForce = -config.friction * 0.001 * velocity
          const acceleration = (springForce + dampingForce) / config.mass // pt/ms^2

          velocity = velocity + acceleration * step // pt/ms
          position = position + velocity * step
        }
      }

      invariant(
        !Number.isNaN(position),
        `Found NaN value while advancing "${spring.key}" animation`
      )

      if (position !== node.lastPosition) {
        changed = true
        node.setValue(position)
        node.lastPosition = position
        node.lastVelocity = velocity
      }

      if (finished && canFinish) {
        node.done = true
      } else {
        idle = false
      }
    })

    // Notify observers.
    if (changed) {
      spring._onChange(spring.get(), idle)
    }

    // Exit the frameloop.
    if (idle) {
      spring.finish()
    }
  }
}
