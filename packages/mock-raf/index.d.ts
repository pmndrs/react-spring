// Type definitions for mock-raf 1.0
// Project: https://github.com/FormidableLabs/mock-raf
// Definitions by: Daniel Pereira <https://github.com/djpereira>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export type FrameRequestCallback = (time: number) => void

export namespace MockRaf {
  interface Options {
    /** The time that should pass during each requestAnimationFrame step in milliseconds. Default is roughly equivalent to default browser behavior. */
    time?: number

    /** The number of steps to take. */
    count?: number
  }
}

/** Creates a mockRaf instance, exposing the functions you'll use to interact with the mock. */
export interface MockRaf {
  /**
   * Returns the current now value of the mock. Starts at 0 and increases with each step() taken.
   * Useful for stubbing out performance.now() or a polyfill when using requestAnimationFrame with timers.
   */
  now(): number

  /** Replacement for requestAnimationFrame or a polyfill.Adds a callback to be fired on the next step. */
  raf(callback: FrameRequestCallback): number

  /** Replacement for cancelAnimationFrame or a polyfill.Removes all currently scheduled requestAnimationFrame callbacks from the queue. */
  cancel(handle: number): void

  /** Takes requestAnimationFrame steps. Fires currently queued callbacks for each step and increments now time for each step. The primary way to interact with a mockRaf instance for testing. */
  step(options?: MockRaf.Options): void

  /** Continously iterate the requestAnimationFrame queue until empty. Useful for jumping to the end of an animation or group of animations. */
  flush(): void
}

export default function createMockRaf(): MockRaf
