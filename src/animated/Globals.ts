import { MutableRefObject, ReactType } from 'react'
import createInterpolation from '../shared/interpolation'
import AnimatedStyle from './AnimatedStyle'

interface ApplyAnimatedValues {
  fn(node?: any, props?: any): undefined | false
  transform<Style extends object>(style: Style): Style
}
export let applyAnimatedValues: ApplyAnimatedValues
export function injectApplyAnimatedValues(
  fn: ApplyAnimatedValues['fn'],
  transform: ApplyAnimatedValues['transform']
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

export let interpolation: typeof createInterpolation
export function injectInterpolation(cls: typeof interpolation) {
  interpolation = cls
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
  <T extends ReactType>(node: MutableRefObject<T>): T
  <T extends ReactType>(
    node: MutableRefObject<T>,
    mounted: MutableRefObject<boolean>,
    forceUpdate: () => void
  ): {
    getNode(): T
    setNativeProps(props: any): void
  }
}
export let animatedApi: AnimatedApi
export function injectAnimatedApi(fn: typeof animatedApi) {
  animatedApi = fn
}

export let createAnimatedStyle: (style: any) => AnimatedStyle
export function injectCreateAnimatedStyle(factory: typeof createAnimatedStyle) {
  createAnimatedStyle = factory
}
