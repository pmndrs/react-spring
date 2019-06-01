/// <reference types="react" />
import { SpringInterpolator, InterpolatorConfig } from './types'
interface FrameRequestCallback {
  (time: number): void
}
declare type Props = {
  [key: string]: any
}
export interface AnimatedRef<T> {
  getNode(): T
  setNativeProps(props: Props): void
}
export declare let applyAnimatedValues: (
  node: any,
  props: Props
) => boolean | void
export declare let createStringInterpolator: (
  config: InterpolatorConfig<string>
) => (input: number) => string
export declare let frameLoop: {
  update: () => boolean
  controllers: any[]
  start(controller: any): void
  stop(controller: any): void
}
export declare let now: () => number
export declare let colorNames: {
  [key: string]: number
}
export declare let defaultElement: any
export declare let createAnimatedStyle: ((style: any) => any) | undefined
export declare let createAnimatedTransform:
  | ((transform: any) => any)
  | undefined
export declare let createAnimatedInterpolation: SpringInterpolator
export declare let createAnimatedRef: <T extends React.ElementType>(
  node: React.MutableRefObject<T>,
  mounted: React.MutableRefObject<boolean>,
  forceUpdate: () => void
) => T | AnimatedRef<T>
export declare let requestAnimationFrame:
  | ((cb: FrameRequestCallback) => number)
  | (() => void)
export declare let cancelAnimationFrame: (id: number) => void
export interface AnimatedGlobals {
  now?: typeof now
  frameLoop?: typeof frameLoop
  colorNames?: typeof colorNames
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
export declare const assign: (globals: AnimatedGlobals) => AnimatedGlobals
export {}
