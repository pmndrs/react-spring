import { FrameRequestCallback } from './types'
import { is } from './helpers'
import * as G from './globals'

export type RequestFrameFn = (cb: FrameRequestCallback) => number | void

export interface OpaqueAnimation {
  idle: boolean
  priority: number
  advance(dt: number): void
}

/** Create a frameloop singleton */
export class FrameLoop {
  /**
   * Start a new animation, or reorder an active animation in
   * the animations array in response to a priority change.
   */
  start: (animation: OpaqueAnimation) => void

  /**
   * Update every active animation.
   *
   * Can be passed to `requestAnimationFrame` without wrapping or binding.
   */
  update: (time?: number) => void

  /**
   * Execute a function once after all animations have updated.
   */
  onFrame: (cb: FrameRequestCallback) => void

  /**
   * Execute a function once at the very end of the current frame.
   *
   * Only call this within an `onFrame` callback.
   */
  onWrite: (cb: FrameRequestCallback) => void

  constructor(
    // The global `requestAnimationFrame` must be dereferenced to avoid "Illegal invocation" errors
    requestFrame: RequestFrameFn = fn => (void 0, G.requestAnimationFrame)(fn)
  ) {
    let idle = true
    let writing = false

    // The most recent framestamp
    let lastTime = 0

    // The active animations for the current frame, sorted by lowest priority first
    let animations: OpaqueAnimation[] = []

    // The priority of the currently advancing animation
    let priority = 0

    // Animations starting on the next frame
    const startQueue = new Set<OpaqueAnimation>()

    // Flushed after all animations are updated
    const frameQueue = new Set<FrameRequestCallback>()

    // Flushed at the very end of each frame
    const writeQueue = new Set<FrameRequestCallback>()

    // Add an animation to the frameloop
    const start = (animation: OpaqueAnimation) => {
      const index = animations.findIndex(
        other => other.priority > animation.priority
      )
      animations.splice(~index ? index : animations.length, 0, animation)
      kickoff()
    }

    // Start the frameloop
    const kickoff = () => {
      if (idle) {
        idle = false
        lastTime = G.performanceNow()
        requestFrame(update)
      }
    }

    // Process the current frame
    const update = (this.update = time => {
      if (idle) return
      if (is.und(time)) {
        time = G.performanceNow()
      }

      let dt = time - lastTime
      if (dt > 0) {
        // http://gafferongames.com/game-physics/fix-your-timestep/
        if (dt > 64) dt = 64

        if (startQueue.size) {
          startQueue.forEach(start)
          startQueue.clear()
        }

        // Animations can be added while the frameloop is updating,
        // but they need a higher priority to be start on this frame.
        if (animations.length) {
          animations = animations.filter(animation => {
            priority = animation.priority

            // Animations may go idle before the next frame.
            if (!animation.idle) {
              animation.advance(dt)
            }

            // Remove idle animations.
            return !animation.idle
          })
          priority = 0
        }

        if (frameQueue.size) {
          frameQueue.forEach(onFrame => onFrame(time))
          frameQueue.clear()
        }

        // Writes are batched to avoid layout thrashing.
        if (writeQueue.size) {
          writing = true
          writeQueue.forEach(write => write(time))
          writeQueue.clear()
          writing = false
        }

        if (!animations.length) {
          idle = true
          return
        }
      }

      lastTime = time
      requestFrame(update)
    })

    this.start = animation => {
      const index = animations.indexOf(animation)
      if (~index) {
        animations.splice(index, 1)
      }
      if (priority > animation.priority) {
        startQueue.add(animation)
      } else {
        start(animation)
      }
    }

    this.onFrame = cb => {
      frameQueue.add(cb)
      kickoff()
    }

    this.onWrite = cb => {
      if (writing) cb(lastTime)
      else writeQueue.add(cb)
    }
  }
}
