import { ElementType } from 'react'
import { FluidValue } from 'fluids'

import { InterpolatorConfig, InterpolatorArgs, OneOrMore } from './types'
import { FrameLoop } from './FrameLoop'
import { noop } from './helpers'

//
// Required
//

export let defaultElement: string | ElementType

export let applyAnimatedValues: (node: any, props: any) => boolean | void

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

export let getComponentProps = (props: any) => props

export let createAnimatedStyle = null as ((style: any) => any) | null

export let createAnimatedTransform = null as ((transform: any) => any) | null

declare const window: {
  requestAnimationFrame: (cb: (time: number) => void) => number
  cancelAnimationFrame: (id: number) => void
}

export let requestAnimationFrame: (cb: (time: number) => void) => number =
  typeof window !== 'undefined' ? window.requestAnimationFrame : () => -1

export let cancelAnimationFrame: (id: number) => void =
  typeof window !== 'undefined' ? window.cancelAnimationFrame : noop

export let batchedUpdates = (callback: () => void) => callback()

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
  /** The `div` element equivalent for the current platform */
  defaultElement?: typeof defaultElement
  /** Intercept props before they're passed to an animated component */
  getComponentProps?: typeof getComponentProps
  /** Provide custom logic for native updates */
  applyAnimatedValues?: typeof applyAnimatedValues
  /** Provide custom logic for string interpolation */
  createStringInterpolator?: typeof createStringInterpolator
  /** Wrap the `transform` prop with an animated node */
  createAnimatedTransform?: typeof createAnimatedTransform
  /** Wrap the `style` prop with an animated node */
  createAnimatedStyle?: typeof createAnimatedStyle
  /** Schedule a function to run on the next frame */
  requestAnimationFrame?: typeof requestAnimationFrame
  /** Prevent a scheduled function from running on the next frame */
  cancelAnimationFrame?: typeof cancelAnimationFrame
  /** Event props are called with `batchedUpdates` to reduce extraneous renders */
  batchedUpdates?: typeof batchedUpdates
}

export const assign = (globals: AnimatedGlobals): AnimatedGlobals =>
  ({
    to,
    now,
    frameLoop,
    colorNames,
    skipAnimation,
    defaultElement,
    getComponentProps,
    applyAnimatedValues,
    createStringInterpolator,
    createAnimatedTransform,
    createAnimatedStyle,
    requestAnimationFrame,
    cancelAnimationFrame,
    batchedUpdates,
  } = Object.assign(
    {
      to,
      now,
      frameLoop,
      colorNames,
      skipAnimation,
      defaultElement,
      getComponentProps,
      applyAnimatedValues,
      createStringInterpolator,
      createAnimatedTransform,
      createAnimatedStyle,
      requestAnimationFrame,
      cancelAnimationFrame,
      batchedUpdates,
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
