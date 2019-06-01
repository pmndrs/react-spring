import { ElementType } from 'react'
export declare const createAnimatedComponent: CreateAnimated
declare type WithExtend<T> = T & {
  extend: (
    ...args: Array<AnimatedTarget | Array<AnimatedTarget>>
  ) => WithExtend<T>
}
/** Strings like "div", or components, or a map of components, or an array of those */
declare type AnimatedTarget =
  | string
  | ElementType
  | {
      [key: string]: ElementType
    }
declare type CreateAnimated = (Component: ElementType) => any
/** Add an `extend` method to your `animated` factory function */
export declare function withExtend<T extends CreateAnimated>(
  animated: T,
  options?: {
    lowercase?: boolean
  }
): WithExtend<T>
export {}
