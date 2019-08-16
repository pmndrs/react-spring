import { withAnimated, extendAnimated } from '@react-spring/animated'
import { CSSProperties, ForwardRefExoticComponent } from 'react'
import { SpringValue, ElementType, ComponentPropsWithRef, Merge } from 'shared'
import { elements, JSXElements } from './elements'

type DOMComponents = {
  [Tag in JSXElements]: AnimatedComponent<Tag>
}

type CreateAnimated = <T extends ElementType>(
  wrappedComponent: T
) => AnimatedComponent<T>

// Extend `animated` with every available DOM element
export const animated: CreateAnimated & DOMComponents = extendAnimated(
  withAnimated,
  elements
)

export { animated as a }

/** The type of an `animated()` component */
export type AnimatedComponent<
  T extends ElementType
> = ForwardRefExoticComponent<
  AnimatedProps<Merge<ComponentPropsWithRef<T>, { style?: StyleProps }>> & {
    scrollTop?: SpringValue<number> | number
    scrollLeft?: SpringValue<number> | number
  }
>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = {
  [P in keyof Props]: (P extends 'ref' | 'key'
    ? Props[P]
    : AnimatedProp<Props[P]>)
}

type StyleProps = Merge<CSSProperties, TransformProps>
type StylePropKeys = keyof StyleProps

type ValidStyleProps<T extends object> = {
  [P in keyof T & StylePropKeys]: T[P] extends StyleProps[P] ? P : never
}[keyof T & StylePropKeys]

// The animated prop value of a React element
type AnimatedProp<T> = [T, T] extends [infer T, infer DT]
  ? [DT] extends [never]
    ? never
    : DT extends void
    ? undefined
    : DT extends object
    ? [ValidStyleProps<DT>] extends [never]
      ? DT extends ReadonlyArray<any>
        ? AnimatedStyles<DT>
        : DT
      : AnimatedStyle<T>
    : DT | AnimatedLeaf<T>
  : never

// An animated array of style objects
type AnimatedStyles<T extends ReadonlyArray<any>> = {
  [P in keyof T]: [T[P]] extends [infer DT]
    ? DT extends object
      ? [ValidStyleProps<DT>] extends [never]
        ? DT extends ReadonlyArray<any>
          ? AnimatedStyles<DT>
          : DT
        : { [P in keyof DT]: AnimatedProp<DT[P]> }
      : DT
    : never
}

// An animated object of style attributes
type AnimatedStyle<T> = [T, T] extends [infer T, infer DT]
  ? DT extends void
    ? undefined
    : [DT] extends [never]
    ? never
    : DT extends object
    ? AnimatedObject<DT>
    : DT | AnimatedLeaf<T>
  : never

type AnimatedObject<T extends object> =
  | { [P in keyof T]: AnimatedStyle<T[P]> }
  | (T extends ReadonlyArray<number | string> ? SpringValue<T> : never)

// An animated value that is not an object
type AnimatedLeaf<T> = [T] extends [object]
  ? never
  : SpringValue<Exclude<T, object | void>>

type Angle = number | string
type Length = number | string

type TransformProps = {
  transform?: string
  x?: Length
  y?: Length
  z?: Length
  translate?: Length | [Length, Length]
  translateX?: Length
  translateY?: Length
  translateZ?: Length
  translate3d?: [Length, Length, Length]
  rotate?: Angle
  rotateX?: Angle
  rotateY?: Angle
  rotateZ?: Angle
  rotate3d?: [number, number, number, Angle]
  scale?: number | [number, number]
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  scale3d?: [number, number, number]
  skew?: Angle | [Angle, Angle]
  skewX?: Angle
  skewY?: Angle
  matrix?: [number, number, number, number, number, number]
  matrix3d?: [
    number, // a1
    number,
    number,
    number,
    number, // a2
    number,
    number,
    number,
    number, // a3
    number,
    number,
    number,
    number, // a4
    number,
    number,
    number
  ]
}
