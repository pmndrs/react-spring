import { Globals as G, flushCalls } from '@react-spring/shared'

export interface FrameRequestCallback {
  (time?: number): void
}

export interface RequestFrameFn {
  (cb: FrameRequestCallback): number | void
}

declare const console: any
declare const process:
  | { env: { [key: string]: string | undefined } }
  | undefined

export interface OpaqueAnimation {
  idle: boolean
  priority: number
  advance(dt: number): void
}

export interface Timeout {
  time: number
  handler: () => void
  cancel: () => void
}

declare const performance: { now: () => number }

export let batchedUpdates = (callback: () => void) => callback()

export let now = () => performance.now()

/**
 * FrameLoop executes its animations in order of lowest priority first.
 * Animations are retained until idle.
 */
export class FrameLoop {
  /**
   * Start a new animation, or reorder an active animation in
   * the animations array in response to a priority change.
   */
  start: (animation: OpaqueAnimation) => void

  /**
   * Advance the animations to the current time.
   */
  advance: () => void

  /**
   * Invoke the given `handler` on the soonest frame after the given
   * `ms` delay is completed. When the delay is `<= 0`, the handler is
   * invoked immediately.
   */
  setTimeout: (handler: () => void, ms: number) => Timeout

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
  protected _dispose!: () => void

  constructor(raf: RequestFrameFn) {
    let idle = true
    let writing = false

    // The most recent framestamp
    let lastTime = 0

    // The animations being updated in the current frame, sorted by lowest
    // priority first. These two arrays are swapped at the end of each frame.
    let currentFrame: OpaqueAnimation[] = []
    let prevFrame: OpaqueAnimation[] = []

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
    const start = (animation: OpaqueAnimation) =>
      currentFrame.indexOf(animation) < 0 &&
      currentFrame.splice(
        findIndex(
          currentFrame,
          existing => existing.priority > animation.priority
        ),
        0,
        animation
      )

    const loop = () => {
      if (idle) return
      raf(loop)
      try {
        advance()
      } catch (e) {
        console.error(e)
      }
    }

    // Start the frameloop
    const kickoff = () => {
      if (idle) {
        idle = false

        // To minimize frame skips, the frameloop never stops.
        if (lastTime == 0) {
          lastTime = now()
          raf(loop)
        }
      }
    }

    const timeoutQueue: Timeout[] = []

    this.setTimeout = (handler, ms) => {
      const time = now() + ms
      const cancel = () => {
        const index = timeoutQueue.findIndex(t => t.cancel == cancel)
        if (index >= 0) {
          timeoutQueue.splice(index, 1)
        }
      }

      const index = findIndex(timeoutQueue, t => t.time > time)
      const timeout = { time, handler, cancel }
      timeoutQueue.splice(index, 0, timeout)

      kickoff()
      return timeout
    }

    // Process the current frame.
    const advance = (this.advance = () => {
      const time = now()

      // Start animations that were added during last frame.
      if (startQueue.size) {
        startQueue.forEach(start)
        startQueue.clear()
      }

      // Flush the timeout queue.
      if (timeoutQueue.length) {
        batchedUpdates(() => {
          const count = findIndex(timeoutQueue, t => t.time > time)
          timeoutQueue.splice(0, count).forEach(t => t.handler())
        })
      }

      if (time > lastTime) {
        // http://gafferongames.com/game-physics/fix-your-timestep/
        const dt = Math.min(64, time - lastTime)
        lastTime = time

        batchedUpdates(() => {
          if (currentFrame.length) {
            const nextFrame = prevFrame
            for (let i = 0; i < currentFrame.length; i++) {
              const animation = currentFrame[i]
              priority = animation.priority

              // Animations may go idle before the next frame.
              if (!animation.idle) {
                G.willAdvance(animation)
                animation.advance(dt)
                if (!animation.idle) {
                  nextFrame.push(animation)
                }
              }
            }
            priority = 0
            // Reuse the `currentFrame` array to avoid garbage collection.
            prevFrame = currentFrame
            prevFrame.length = 0
            // Set `currentFrame` for next frame, so the `start` function
            // adds new animations to the proper array.
            currentFrame = nextFrame
          }

          flushCalls(frameQueue, time)

          if (writeQueue.size) {
            writing = true
            flushCalls(writeQueue, time)
            writing = false
          }
        })
      }
    })

    this.start = animation => {
      // An animation can be added while a frame is being processed,
      // unless its priority is lower than the animation last updated.
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
      const isIdle = () =>
        !startQueue.size && !currentFrame.length && !timeoutQueue.length

      const dispose = () => {
        idle = true
        startQueue.clear()
        timeoutQueue.length = 0
      }

      Object.defineProperties(this, {
        _idle: { get: isIdle },
        _dispose: { get: () => dispose },
      })
    }
  }
}

/** Like `Array.prototype.findIndex` but returns `arr.length` instead of `-1` */
function findIndex<T>(arr: T[], test: (value: T) => boolean) {
  const index = arr.findIndex(test)
  return index < 0 ? arr.length : index
}
