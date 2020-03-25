import { FrameRequestCallback } from './types'
import { is } from './helpers'
import * as G from './globals'

declare const process:
  | { env: { [key: string]: string | undefined } }
  | undefined

export type RequestFrameFn = (cb: FrameRequestCallback) => number | void

export interface OpaqueAnimation {
  idle: boolean
  priority: number
  advance(dt: number): void
}

/**
 * FrameLoop executes its animations in order of lowest priority first.
 * Animations are released once idle. The loop is paused while no animations
 * exist.
 */
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

  // Exposed for testing.
  protected _idle!: boolean
  protected _animations!: OpaqueAnimation[]

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

    // The priority of the currently advancing animation.
    // To protect against a race condition whenever a frame is being processed,
    // where the filtering of `animations` is corrupted with a shifting index,
    // causing animations to potentially advance 2x faster than intended.
    let priority = 0

    // Animations starting on the next frame
    const startQueue = new Set<OpaqueAnimation>()

    // Flushed after all animations are updated.
    // Used to dispatch events to an "onFrame" prop, for example.
    const frameQueue = new Set<FrameRequestCallback>()

    // Flushed at the very end of each frame.
    // Used to avoid layout thrashing in @react-spring/web, for example.
    const writeQueue = new Set<FrameRequestCallback>()

    // Add an animation to the frameloop
    const start = (animation: OpaqueAnimation) => {
      let index = animations.indexOf(animation)
      if (index < 0) {
        index = animations.findIndex(
          other => other.priority > animation.priority
        )
        animations.splice(~index ? index : animations.length, 0, animation)
      }
    }

    // Start the frameloop
    const kickoff = () => {
      if (idle) {
        idle = false

        // To minimize frame skips, the frameloop never stops.
        if (lastTime == 0) {
          lastTime = G.now()
          requestFrame(update)
        }
      }
    }

    // Process the current frame
    const update = (this.update = time => {
      if (is.und(time)) {
        time = G.now()
      }
      if (!idle && time > lastTime) {
        // http://gafferongames.com/game-physics/fix-your-timestep/
        const dt = Math.min(64, time - lastTime)

        if (startQueue.size) {
          startQueue.forEach(start)
          startQueue.clear()
        }

        G.batchedUpdates(() => {
          // Animations can be added while the frameloop is updating,
          // but they need a higher priority to be started on this frame.
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

          if (writeQueue.size) {
            writing = true
            writeQueue.forEach(write => write(time))
            writeQueue.clear()
            writing = false
          }
        })

        if (!animations.length) {
          idle = true
        }
      }
      lastTime = time
      requestFrame(update)
    })

    this.start = animation => {
      if (priority > animation.priority) {
        startQueue.add(animation)
      } else {
        start(animation)
        kickoff()
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

    // Expose internals for testing.
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV !== 'production'
    ) {
      Object.defineProperties(this, {
        _idle: { get: () => idle },
        _animations: { get: () => animations },
      })
    }
  }
}
