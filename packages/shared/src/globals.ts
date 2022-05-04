import { raf, Rafz } from '@react-spring/rafz'
import {
  OneOrMore,
  InterpolatorConfig,
  InterpolatorArgs,
} from '@react-spring/types'

import { FluidValue } from './fluids'
import type { OpaqueAnimation } from './FrameLoop'
import { noop } from './helpers'

//
// Required
//

export let createStringInterpolator: (
  config: InterpolatorConfig<string>
) => (input: number) => string

//
// Optional
//

export let to: <Input, Output>(
  source: OneOrMore<FluidValue>,
  args: InterpolatorArgs<Input, Output>
) => FluidValue<Output>

export let colors = null as { [key: string]: number } | null

export let skipAnimation = false as boolean

export let willAdvance: (animation: OpaqueAnimation) => void = noop

//
// Configuration
//

export interface AnimatedGlobals {
  /** Returns a new `Interpolation` object */
  to?: typeof to
  /** Used to measure frame length. Read more [here](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) */
  now?: typeof raf.now
  /** Provide custom color names for interpolation */
  colors?: typeof colors
  /** Make all animations instant and skip the frameloop entirely */
  skipAnimation?: typeof skipAnimation
  /** Provide custom logic for string interpolation */
  createStringInterpolator?: typeof createStringInterpolator
  /** Schedule a function to run on the next frame */
  requestAnimationFrame?: (cb: () => void) => void
  /** Event props are called with `batchedUpdates` to reduce extraneous renders */
  batchedUpdates?: typeof raf.batchedUpdates
  /** @internal Exposed for testing purposes */
  willAdvance?: typeof willAdvance
  /** sets the global frameLoop setting for the global raf instance */
  frameLoop?: Rafz['frameLoop']
}

export const assign = (globals: AnimatedGlobals) => {
  if (globals.to) to = globals.to
  if (globals.now) raf.now = globals.now
  if (globals.colors !== undefined) colors = globals.colors
  if (globals.skipAnimation != null) skipAnimation = globals.skipAnimation
  if (globals.createStringInterpolator)
    createStringInterpolator = globals.createStringInterpolator
  if (globals.requestAnimationFrame) raf.use(globals.requestAnimationFrame)
  if (globals.batchedUpdates) raf.batchedUpdates = globals.batchedUpdates
  if (globals.willAdvance) willAdvance = globals.willAdvance
  if (globals.frameLoop) raf.frameLoop = globals.frameLoop
}
