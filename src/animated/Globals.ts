import { MutableRefObject, ReactType } from 'react'
import { InterpolationConfig } from '../types/interpolation'
import AnimatedStyle from './AnimatedStyle'

type ApplyPropsFunction = (node?: any, props?: any) => undefined | false
type TransformFunction = (style: any) => any
export let applyAnimatedValues: {
  fn: ApplyPropsFunction
  transform: TransformFunction
}
export function injectApplyAnimatedValues(
  fn: ApplyPropsFunction,
  transform: TransformFunction
) {
  applyAnimatedValues = { fn, transform }
}

export let colorNames: { [key: string]: number }
export function injectColorNames(names: typeof colorNames) {
  colorNames = names
}

export let requestFrame: typeof window.requestAnimationFrame = cb =>
  typeof window !== 'undefined' ? window.requestAnimationFrame(cb) : -1
export let cancelFrame: typeof window.cancelAnimationFrame = id => {
  typeof window !== 'undefined' && window.cancelAnimationFrame(id)
}
export function injectFrame(raf: typeof requestFrame, caf: typeof cancelFrame) {
  requestFrame = raf
  cancelFrame = caf
}

export let interpolation: (
  config: InterpolationConfig<string>
) => (input: number) => string
export function injectStringInterpolator(fn: typeof interpolation) {
  interpolation = fn
}

export let now = () => Date.now()
export function injectNow(nowFn: typeof now) {
  now = nowFn
}

export let defaultElement: any
export function injectDefaultElement(el?: typeof defaultElement) {
  defaultElement = el
}

interface AnimatedApi {
  <T extends ReactType>(
    node: MutableRefObject<T>,
    mounted?: MutableRefObject<boolean>,
    forceUpdate?: () => void
  ):
    | T
    | {
        getNode(): T
        setNativeProps(props: any): void
      }
}
export let animatedApi: AnimatedApi = (node: any) => node.current
export function injectAnimatedApi(fn: typeof animatedApi) {
  animatedApi = fn
}

export let createAnimatedStyle: (style: any) => AnimatedStyle
export function injectCreateAnimatedStyle(factory: typeof createAnimatedStyle) {
  createAnimatedStyle = factory
}

export let manualFrameloop: any
export function injectManualFrameloop(callback: any) {
  manualFrameloop = callback
}
