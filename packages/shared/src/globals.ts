import { SpringInterpolator, InterpolatorConfig } from './types'

declare const window: {
  requestAnimationFrame: (cb: (time: number) => void) => number
  cancelAnimationFrame: (id: number) => void
}

type Props = { [key: string]: any }

export interface AnimatedRef<T> {
  getNode(): T
  setNativeProps(props: Props): void
}

//
// Required
//

export let applyAnimatedValues: (node: any, props: Props) => boolean | void

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

export let colorNames: { [key: string]: number } = {}

export let skipAnimation = false

export let defaultElement: any

export let createAnimatedStyle: ((style: any) => any) | undefined

export let createAnimatedTransform: ((transform: any) => any) | undefined

export let createAnimatedInterpolation: SpringInterpolator

export let createAnimatedRef: <T extends React.ElementType>(
  node: React.MutableRefObject<T>,
  mounted: React.MutableRefObject<boolean>,
  forceUpdate: () => void
) => T | AnimatedRef<T> = node => node.current

export let requestAnimationFrame =
  typeof window !== 'undefined' ? window.requestAnimationFrame : () => {}

export let cancelAnimationFrame =
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
  createAnimatedRef?: typeof createAnimatedRef
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
    createAnimatedRef,
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
      createAnimatedRef,
      requestAnimationFrame,
      cancelAnimationFrame,
    },
    globals
  ))
