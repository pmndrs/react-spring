import * as G from 'shared/globals'
import { is, each } from 'shared'
import { isDependency } from '@react-spring/animated'
import { FrameRequestCallback } from 'shared/types'
import { SpringValue } from './SpringValue'

type FrameUpdater = (this: FrameLoop, time?: number) => boolean
type RequestFrameFn = (cb: FrameRequestCallback) => number | void

export class FrameLoop {
  /**
   * The animated springs
   */
  springs = new Set<SpringValue>()

  /**
   * True when at least one spring is animating.
   */
  active = true

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

  /**
   * This is called at the end of every frame.
   */
  private _currFrameQueue = new Set<FrameRequestCallback>()
  private _nextFrameQueue = new Set<FrameRequestCallback>()

  /**
   * The `requestAnimationFrame` function or a custom scheduler.
   */
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

        if (is.und(time)) time = performance.now()
        let dt = is.und(this.lastTime) ? 0 : time - this.lastTime

        // http://gafferongames.com/game-physics/fix-your-timestep/
        if (dt > 64) dt = 64

        if (dt > 0) {
          // Update the animations.
          runTopological(
            Array.from(this.springs),
            spring => spring.idle || this.advance(dt, spring)
          )
          const onFrameQueue = this._currFrameQueue
          if (onFrameQueue.size) {
            this._currFrameQueue = this._nextFrameQueue
            this._nextFrameQueue = onFrameQueue
            onFrameQueue.forEach(onFrame => onFrame())
            onFrameQueue.clear()
          }
          if (!this.springs.size) {
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
   * Call a function on every frame, after all springs have been updated.
   *
   * Call the returned function to stop listening.
   */
  onFrame(cb: FrameRequestCallback) {
    this._currFrameQueue.add(cb)
    return () => this._currFrameQueue.delete(cb)
  }

  /**
   * Start animating the given spring
   */
  start(spring: SpringValue) {
    this.springs.add(spring)
    if (!this.active) {
      this.active = true
      this._requestFrame(this.update)
    }
  }

  /**
   * Stop animating the given spring
   */
  stop(spring: SpringValue) {
    this.springs.delete(spring)
  }

  /**
   * Advance an animation forward one frame.
   */
  advance(dt: number, spring: SpringValue) {
    let idle = true
    let changed = false

    const anim = spring.animation!
    const parent = isDependency(anim.to) && anim.to
    const payload = parent && parent.node.getPayload()

    anim.values.forEach((node, i) => {
      if (node.done) return
      changed = true

      let to: number = payload ? payload[i].getValue() : anim.toValues![i]

      // Jump to end value for immediate animations
      if (anim.immediate) {
        node.setValue(to)
        node.done = true
        return
      }

      const elapsed = (node.elapsedTime += dt)

      const from = anim.fromValues[i]
      const config = anim.config

      const v0 = is.arr(config.velocity) ? config.velocity[i] : config.velocity
      const precision =
        config.precision || Math.min(1, Math.abs(to - from) * 0.001)

      let position = node.lastPosition
      let velocity: number
      let finished: boolean

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

        const step = 0.05 / config.w0
        const numSteps = Math.ceil(dt / step)

        for (let n = 0; n < numSteps; ++n) {
          const springForce = -config.tension * 0.000001 * (position - to)
          const dampingForce = -config.friction * 0.001 * velocity
          const acceleration = (springForce + dampingForce) / config.mass // pt/ms^2
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
            -velocity * (config.clamp === true ? 0 : (config.clamp as number))
        }

        const isVelocity = Math.abs(velocity) <= precision
        const isDisplacement =
          config.tension !== 0 ? Math.abs(to - position) <= precision : true

        finished =
          (isBouncing && velocity === 0) || (isVelocity && isDisplacement)
      }

      // Trails aren't done until their parents conclude
      if (finished && !(payload && payload.some(node => !node.done))) {
        position = parent ? to : anim.to
        node.done = true
      } else {
        idle = false
      }

      node.setValue(position)
      node.lastPosition = position
      node.lastVelocity = velocity
    })

    // Notify observers.
    if (changed) {
      spring._onChange(spring.get(), idle)
    }

    // Exit the frameloop.
    if (idle) {
      spring._finish()
    }
  }
}

function runTopological(
  springs: SpringValue[],
  action: (spring: SpringValue, id: number) => void
) {
  const visited: true[] = []
  each(springs, function run(spring: SpringValue, i: number) {
    if (visited[i]) return
    visited[i] = true

    const { to } = spring
    if (to instanceof SpringValue) {
      const i = springs.indexOf(to)
      if (~i) run(to, i)
    }

    action(spring, spring.id)
  })
}
