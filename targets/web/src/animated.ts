import { CSSProperties, ForwardRefExoticComponent } from 'react'
import {
  ElementType,
  ComponentPropsWithRef,
  Merge,
  FluidValue,
  FluidProps,
} from '@react-spring/shared'
import { Primitives } from './primitives'

type AnimatedPrimitives = {
  [Tag in Primitives]: AnimatedComponent<Tag>
}

/** The type of the `animated()` function */
export type WithAnimated = {
  <T extends ElementType>(wrappedComponent: T): AnimatedComponent<T>
} & AnimatedPrimitives

/** The type of an `animated()` component */
export type AnimatedComponent<
  T extends ElementType
> = ForwardRefExoticComponent<
  AnimatedProps<Merge<ComponentPropsWithRef<T>, { style?: StyleProps }>> &
    FluidProps<{
      scrollTop?: number
      scrollLeft?: number
    }>
>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = {
  [P in keyof Props]: P extends 'ref' | 'key'
    ? Props[P]
    : AnimatedProp<Props[P]>
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
  | (T extends ReadonlyArray<number | string> ? FluidValue<Readonly<T>> : never)

// An animated primitive (or an array of them)
type AnimatedLeaf<T> =
  | Exclude<T, object | void>
  | Extract<T, ReadonlyArray<number | string>> extends infer U
  ? [U] extends [never]
    ? never
    : FluidValue<U | Exclude<T, object | void>>
  : never

type Angle = number | string
type Length = number | string

type TransformProps = {
  transform?: string
  x?: Length
  y?: Length
  z?: Length
  translate?: Length | readonly [Length, Length]
  translateX?: Length
  translateY?: Length
  translateZ?: Length
  translate3d?: readonly [Length, Length, Length]
  rotate?: Angle
  rotateX?: Angle
  rotateY?: Angle
  rotateZ?: Angle
  rotate3d?: readonly [number, number, number, Angle]
  // Note: "string" is not really supported by "scale", but this lets us
  // spread React.CSSProperties into an animated style object.
  scale?: number | readonly [number, number] | string
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  scale3d?: readonly [number, number, number]
  skew?: Angle | readonly [Angle, Angle]
  skewX?: Angle
  skewY?: Angle
  matrix?: readonly [number, number, number, number, number, number]
  matrix3d?: readonly [
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
