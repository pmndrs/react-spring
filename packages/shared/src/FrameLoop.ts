import { raf } from 'rafz'
import * as G from './globals'

export interface OpaqueAnimation {
  idle: boolean
  priority: number
  advance(dt: number): void
}

// Animations starting on the next frame
const startQueue = new Set<OpaqueAnimation>()

// The animations being updated in the current frame, sorted by lowest
// priority first. These two arrays are swapped at the end of each frame.
let currentFrame: OpaqueAnimation[] = []
let prevFrame: OpaqueAnimation[] = []

// The priority of the currently advancing animation.
// To protect against a race condition whenever a frame is being processed,
// where the filtering of `animations` is corrupted with a shifting index,
// causing animations to potentially advance 2x faster than intended.
let priority = 0

/**
 * The frameloop executes its animations in order of lowest priority first.
 * Animations are retained until idle.
 */
export const frameLoop = {
  get idle() {
    return !startQueue.size && !currentFrame.length
  },

  /** Advance the given animation on every frame until idle. */
  start(animation: OpaqueAnimation) {
    // An animation can be added while a frame is being processed,
    // unless its priority is lower than the animation last updated.
    if (priority > animation.priority) {
      startQueue.add(animation)
      raf.onStart(flushStartQueue)
    } else {
      startSafely(animation)
      raf(advance)
    }
  },

  /** Advance all animations by the given time. */
  advance,

  /** Call this when an animation's priority changes. */
  sort(animation: OpaqueAnimation) {
    if (priority) {
      raf.onFrame(() => frameLoop.sort(animation))
    } else {
      const prevIndex = currentFrame.indexOf(animation)
      if (~prevIndex) {
        currentFrame.splice(prevIndex, 1)
        startUnsafely(animation)
      }
    }
  },

  /**
   * Clear all animations. For testing purposes.
   *
   * ☠️ Never call this from within the frameloop.
   */
  clear() {
    currentFrame = []
    startQueue.clear()
    raf.clear()
  },
}

function flushStartQueue() {
  startQueue.forEach(startSafely)
  startQueue.clear()
  raf(advance)
}

function startSafely(animation: OpaqueAnimation) {
  if (!currentFrame.includes(animation)) startUnsafely(animation)
}

function startUnsafely(animation: OpaqueAnimation) {
  currentFrame.splice(
    findIndex(currentFrame, other => other.priority > animation.priority),
    0,
    animation
  )
}

function advance(dt: number) {
  const nextFrame = prevFrame

  for (let i = 0; i < currentFrame.length; i++) {
    const animation = currentFrame[i]
    priority = animation.priority

    // Animations may go idle before advancing.
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

  return currentFrame.length > 0
}

/** Like `Array.prototype.findIndex` but returns `arr.length` instead of `-1` */
function findIndex<T>(arr: T[], test: (value: T) => boolean) {
  const index = arr.findIndex(test)
  return index < 0 ? arr.length : index
}
