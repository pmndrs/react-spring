import { FluidValue } from 'fluids'
import {
  OneOrMore,
  InterpolatorConfig,
  InterpolatorArgs,
} from '@react-spring/types'
import type { FrameLoop, OpaqueAnimation } from './FrameLoop'
import { noop } from './helpers'

//
// Required
//

export let createStringInterpolator: (
  config: InterpolatorConfig<string>
) => (input: number) => string

export let frameLoop: FrameLoop

//
// Optional
//

export let to: <In, Out>(
  source: OneOrMore<FluidValue>,
  args: InterpolatorArgs<In, Out>
) => FluidValue<Out>

declare const performance: { now: () => number }

export let now = () => performance.now()

export let colors = null as { [key: string]: number } | null

export let skipAnimation = false as boolean

declare const window: {
  requestAnimationFrame: (cb: (time: number) => void) => number
}

export let requestAnimationFrame: (cb: (time: number) => void) => void =
  typeof window !== 'undefined' ? window.requestAnimationFrame : () => -1

export let batchedUpdates = (callback: () => void) => callback()

export let willAdvance: (animation: OpaqueAnimation) => void = noop

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
  colors?: typeof colors
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

export const assign = (globals: AnimatedGlobals) => {
  if (globals.to) to = globals.to
  if (globals.now) now = globals.now
  if (globals.frameLoop) frameLoop = globals.frameLoop
  if (globals.colors !== undefined) colors = globals.colors
  if (globals.skipAnimation != null) skipAnimation = globals.skipAnimation
  if (globals.createStringInterpolator)
    createStringInterpolator = globals.createStringInterpolator
  if (globals.requestAnimationFrame)
    requestAnimationFrame = globals.requestAnimationFrame
  if (globals.batchedUpdates) batchedUpdates = globals.batchedUpdates
  if (globals.willAdvance) willAdvance = globals.willAdvance
}
