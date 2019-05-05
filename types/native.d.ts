import { SpringValue, Solve, AssignableKeys } from './lib/common'
import { ViewStyle, View, Text, StyleProp, RecursiveArray } from 'react-native'
import {
  ElementType,
  ComponentPropsWithRef,
  ForwardRefExoticComponent,
} from 'react'

export * from './universal'

type CreateAnimated = <T extends ElementType>(
  wrappedComponent: T
) => AnimatedComponent<T>

/** Create a HOC that accepts `SpringValue` props */
export const animated: CreateAnimated & {
  View: AnimatedComponent<typeof View>
  Text: AnimatedComponent<typeof Text>
}

export { animated as a }

/** The type of an `animated()` component */
export type AnimatedComponent<
  T extends ElementType
> = ForwardRefExoticComponent<
  AnimatedProps<ComponentPropsWithRef<T>> & { children?: ReactNode }
>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = {
  [P in keyof Props]: (P extends 'ref' ? Props[P] : AnimatedProp<Props[P]>)
}

// The animated prop value of a React element
type AnimatedProp<T> = [T, T] extends [infer T, infer DT]
  ? [DT] extends [never]
    ? never
    : DT extends void
    ? undefined
    : DT extends object
    ? [AssignableKeys<DT, ViewStyle>] extends [never]
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
      ? [AssignableKeys<DT, ViewStyle>] extends [never]
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
    ? {
        [P in keyof DT]: P extends 'transform'
          ? AnimatedTransform<DT[P]>
          : AnimatedStyle<DT[P]>
      }
    : DT | AnimatedLeaf<T>
  : never

// An animated array of transform objects
type AnimatedTransform<T> = T extends ReadonlyArray<any>
  ? { [P in keyof T]: AnimatedStyle<T[P]> }
  : T

// An animated value that is not an object
type AnimatedLeaf<T> = [T] extends [object]
  ? never
  : SpringValue<Exclude<T, object | void>>
