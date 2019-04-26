import { MutableRefObject, ReactType } from 'react'
import { InterpolationConfig } from '../types/interpolation'

declare const window: {
  requestAnimationFrame: (cb: FrameRequestCallback) => number
  cancelAnimationFrame: (id: number) => void
}

interface FrameRequestCallback {
  (time: number): void
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
  config: InterpolationConfig<string>
) => (input: number) => string

//
// Optional
//

export let now = () => Date.now()

export let colorNames: { [key: string]: number } = {}

export let defaultElement: any

export let manualFrameloop: (() => void) | undefined

export let createAnimatedStyle: ((style: any) => any) | undefined

export let createAnimatedTransform: ((transform: any) => any) | undefined

export let createAnimatedRef: <T extends ReactType>(
  node: MutableRefObject<T>,
  mounted?: MutableRefObject<boolean>,
  forceUpdate?: () => void
) => T | AnimatedRef<T> = node => node.current

export let requestAnimationFrame =
  typeof window !== 'undefined' ? window.requestAnimationFrame : void 0

export let cancelAnimationFrame =
  typeof window !== 'undefined' ? window.cancelAnimationFrame : void 0

//
// Configuration
//

export interface AnimatedGlobals {
  now?: typeof now
  colorNames?: typeof colorNames
  defaultElement?: typeof defaultElement
  applyAnimatedValues?: typeof applyAnimatedValues
  createStringInterpolator?: typeof createStringInterpolator
  createAnimatedTransform?: typeof createAnimatedTransform
  createAnimatedStyle?: typeof createAnimatedStyle
  createAnimatedRef?: typeof createAnimatedRef
  requestAnimationFrame?: typeof requestAnimationFrame
  cancelAnimationFrame?: typeof cancelAnimationFrame
  manualFrameloop?: typeof manualFrameloop
}

export const assign = (globals: AnimatedGlobals): AnimatedGlobals =>
  ({
    colorNames,
    defaultElement,
    applyAnimatedValues,
    createStringInterpolator,
    createAnimatedTransform,
    createAnimatedStyle,
    createAnimatedRef,
    requestAnimationFrame,
    cancelAnimationFrame,
    manualFrameloop,
  } = Object.assign(
    {
      colorNames,
      defaultElement,
      applyAnimatedValues,
      createStringInterpolator,
      createAnimatedTransform,
      createAnimatedStyle,
      createAnimatedRef,
      requestAnimationFrame,
      cancelAnimationFrame,
      manualFrameloop,
    },
    globals
  ))
