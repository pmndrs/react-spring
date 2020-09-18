import { CSSProperties, ForwardRefExoticComponent } from 'react'
import {
  AssignableKeys,
  ComponentPropsWithRef,
  ElementType,
} from '@react-spring/types'
import { FluidValue } from '@react-spring/shared'
import { KonvaExports, Primitives } from './primitives'

type AnimatedPrimitives = {
  [P in Primitives]: AnimatedComponent<KonvaExports[P]>
}

/** The type of the `animated()` function */
export type WithAnimated = {
  <T extends ElementType>(wrappedComponent: T): AnimatedComponent<T>
} & AnimatedPrimitives

/** The type of an `animated()` component */
export type AnimatedComponent<
  T extends ElementType
> = ForwardRefExoticComponent<AnimatedProps<ComponentPropsWithRef<T>>>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = {
  [P in keyof Props]: P extends 'ref' | 'key'
    ? Props[P]
    : AnimatedProp<Props[P]>
}

// The animated prop value of a React element
type AnimatedProp<T> = [T, T] extends [infer T, infer DT]
  ? [DT] extends [never]
    ? never
    : DT extends void
    ? undefined
    : DT extends object
    ? [AssignableKeys<DT, CSSProperties>] extends [never]
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
      ? [AssignableKeys<DT, CSSProperties>] extends [never]
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
    ? { [P in keyof DT]: AnimatedStyle<DT[P]> }
    : DT | AnimatedLeaf<T>
  : never

// An animated primitive (or an array of them)
type AnimatedLeaf<T> =
  | Exclude<T, object | void>
  | Extract<T, ReadonlyArray<number | string>> extends infer U
  ? [U] extends [never]
    ? never
    : FluidValue<U | Exclude<T, object | void>>
  : never
