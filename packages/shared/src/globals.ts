import { FluidValue } from 'fluids'

import { OneOrMore } from './types.util'
import { InterpolatorConfig, InterpolatorArgs } from './types'
import { FrameLoop, OpaqueAnimation } from './FrameLoop'
import { noop } from './helpers'

//
// Required
//

export let createStringInterpolator: (
  config: InterpolatorConfig<string>
) => (input: number) => string

export let frameLoop = new FrameLoop()

//
// Optional
//

export let to: <In, Out>(
  source: OneOrMore<FluidValue>,
  args: InterpolatorArgs<In, Out>
) => FluidValue<Out>

declare const performance: { now: () => number }

export let now = () => performance.now()

export let colorNames = null as { [key: string]: number } | null

export let skipAnimation = false as boolean

declare const window: {
  requestAnimationFrame: (cb: (time: number) => void) => number
}

export let requestAnimationFrame: (cb: (time: number) => void) => void =
  typeof window !== 'undefined' ? window.requestAnimationFrame : () => -1

export let batchedUpdates = (callback: () => void) => callback()

export let willAdvance: (animations: OpaqueAnimation[]) => void = noop

//
// Configuration
//

export interface AnimatedGlobals {
  /** Returns a new `Interpolation` object */
  to?: typeof to
  /** Used to measure frame length. Read more [here](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) */
  now?: typeof now
  /** Provide a custom `FrameLoop` instance */
  frameLoop?: typeof frameLoop
  /** Provide custom color names for interpolation */
  colorNames?: typeof colorNames
  /** Make all animations instant and skip the frameloop entirely */
  skipAnimation?: typeof skipAnimation
  /** Provide custom logic for string interpolation */
  createStringInterpolator?: typeof createStringInterpolator
  /** Schedule a function to run on the next frame */
  requestAnimationFrame?: typeof requestAnimationFrame
  /** Event props are called with `batchedUpdates` to reduce extraneous renders */
  batchedUpdates?: typeof batchedUpdates
  /** @internal Exposed for testing purposes */
  willAdvance?: typeof willAdvance
}

export const assign = (globals: AnimatedGlobals): AnimatedGlobals =>
  ({
    to,
    now,
    frameLoop,
    colorNames,
    skipAnimation,
    createStringInterpolator,
    requestAnimationFrame,
    batchedUpdates,
    willAdvance,
  } = Object.assign(
    {
      to,
      now,
      frameLoop,
      colorNames,
      skipAnimation,
      createStringInterpolator,
      requestAnimationFrame,
      batchedUpdates,
      willAdvance,
    },
    pluckDefined(globals)
  ))

// Ignore undefined values
function pluckDefined(globals: any) {
  const defined: any = {}
  for (const key in globals) {
    if (globals[key] !== undefined) defined[key] = globals[key]
  }
  return defined
}
