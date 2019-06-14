import { SpringInterpolator, InterpolatorConfig } from './types'
import { ElementType } from 'react'

declare const window: {
  requestAnimationFrame: (cb: (time: number) => void) => number
  cancelAnimationFrame: (id: number) => void
}

//
// Required
//

export let defaultElement: string | ElementType

export let applyAnimatedValues: (node: any, props: any) => boolean | void

export let createAnimatedInterpolation: SpringInterpolator

export let createStringInterpolator: (
  config: InterpolatorConfig<string>
) => (input: number) => string

export let frameLoop: {
  update: () => boolean
  controllers: Map<number, any>
  start(controller: any): void
  stop(controller: any): void
}

//
// Optional
//

export let now = () => Date.now()

export let colorNames: { [key: string]: number } | null = null as any

export let skipAnimation = false

export let createAnimatedStyle: ((style: any) => any) | null = null as any

export let createAnimatedTransform:
  | ((transform: any) => any)
  | null = null as any

export let requestAnimationFrame: typeof window.requestAnimationFrame =
  typeof window !== 'undefined' ? window.requestAnimationFrame : () => -1

export let cancelAnimationFrame: typeof window.cancelAnimationFrame =
  typeof window !== 'undefined' ? window.cancelAnimationFrame : () => {}

//
// Configuration
//

export interface AnimatedGlobals {
  now?: typeof now
  frameLoop?: typeof frameLoop
  colorNames?: typeof colorNames
  skipAnimation?: typeof skipAnimation
  defaultElement?: typeof defaultElement
  applyAnimatedValues?: typeof applyAnimatedValues
  createStringInterpolator?: typeof createStringInterpolator
  createAnimatedInterpolation?: typeof createAnimatedInterpolation
  createAnimatedTransform?: typeof createAnimatedTransform
  createAnimatedStyle?: typeof createAnimatedStyle
  requestAnimationFrame?: typeof requestAnimationFrame
  cancelAnimationFrame?: typeof cancelAnimationFrame
}

export const assign = (globals: AnimatedGlobals): AnimatedGlobals =>
  ({
    now,
    frameLoop,
    colorNames,
    skipAnimation,
    defaultElement,
    applyAnimatedValues,
    createStringInterpolator,
    createAnimatedInterpolation,
    createAnimatedTransform,
    createAnimatedStyle,
    requestAnimationFrame,
    cancelAnimationFrame,
  } = Object.assign(
    {
      now,
      frameLoop,
      colorNames,
      skipAnimation,
      defaultElement,
      applyAnimatedValues,
      createStringInterpolator,
      createAnimatedInterpolation,
      createAnimatedTransform,
      createAnimatedStyle,
      requestAnimationFrame,
      cancelAnimationFrame,
    },
    pluckDefined(globals)
  ))

// Ignore undefined values
function pluckDefined(globals: any) {
  const defined: any = {}
  for (const key in globals) {
    if (globals[key] !== void 0) defined[key] = globals[key]
  }
  return defined
}
