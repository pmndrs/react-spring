import { raf, createRafz, type Rafz } from '@react-spring/rafz'
import { frameLoop, createFrameLoop, type FrameLoop } from './FrameLoop'

/**
 * A scheduler and the frameloop it drives. Springs, controllers and
 * interpolations run on the clock they were created on, so a target that
 * drives frames its own way can't stall the others.
 *
 * @internal
 */
export interface Clock {
  raf: Rafz
  frameLoop: FrameLoop
}

/** @internal */
export const createClock = (): Clock => {
  const raf = createRafz()
  return { raf, frameLoop: createFrameLoop(raf) }
}

/**
 * The clock driven by `requestAnimationFrame`, configured through
 * `Globals.assign`.
 *
 * @internal
 */
export const defaultClock: Clock = { raf, frameLoop }

let current = defaultClock

/**
 * The clock new springs, controllers and interpolations are created on: the
 * default clock, unless inside a `withClock` call.
 *
 * @internal
 */
export const currentClock = () => current

/**
 * Anything created inside `fn` (springs, controllers, interpolations) runs on
 * `clock`. Targets wrap their hooks and components with this.
 *
 * @internal
 */
export function withClock<T>(clock: Clock, fn: () => T): T {
  const prev = current
  current = clock
  try {
    return fn()
  } finally {
    current = prev
  }
}
