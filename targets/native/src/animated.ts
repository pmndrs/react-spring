import { withAnimated, extendAnimated } from '@react-spring/animated'
import { ForwardRefExoticComponent } from 'react'
import { Text, View, Image, ViewStyle } from 'react-native'
import {
  AssignableKeys,
  SpringValue,
  ElementType,
  ComponentPropsWithRef,
} from '@react-spring/shared'

// These are converted into `animated` components
const elements = {
  View,
  Text,
  Image,
}

type NativeElements = typeof elements
type NativeComponents = {
  [P in keyof NativeElements]: AnimatedComponent<NativeElements[P]>
}

type CreateAnimated = <T extends ElementType>(
  wrappedComponent: T
) => AnimatedComponent<T>

export const animated: CreateAnimated & NativeComponents = extendAnimated(
  withAnimated,
  Object.values(elements)
)

export { animated as a }

/** The type of an `animated()` component */
export type AnimatedComponent<
  T extends ElementType
> = ForwardRefExoticComponent<AnimatedProps<ComponentPropsWithRef<T>>>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = {
  [P in keyof Props]: (P extends 'ref' | 'key'
    ? Props[P]
    : AnimatedProp<Props[P]>)
}

// The animated prop value of a React element
type AnimatedProp<T> = [T, T] extends [infer T, infer DT] // T is a union, DT is a distributed union
  ? [DT] extends [never]
    ? never
    : DT extends void
    ? undefined
    : DT extends ReadonlyArray<any>
    ? TransformArray extends DT
      ? AnimatedTransform
      : AnimatedStyles<DT>
    : DT extends object
    ? [AssignableKeys<DT, ViewStyle>] extends [never]
      ? DT
      : AnimatedStyle<DT>
    : DT | AnimatedLeaf<T>
  : never

// An animated array of style objects
type AnimatedStyles<T extends ReadonlyArray<any>> = {
  [P in keyof T]: [T[P]] extends [infer DT] // DT is a distributed union
    ? DT extends ReadonlyArray<any>
      ? AnimatedStyles<DT>
      : DT extends object
      ? [AssignableKeys<DT, ViewStyle>] extends [never]
        ? AnimatedProp<DT>
        : { [P in keyof DT]: AnimatedProp<DT[P]> }
      : DT
    : never
}

// An animated object of style attributes
export type AnimatedStyle<T> = [T, T] extends [infer T, infer DT] // T is a union, DT is a distributed union
  ? DT extends void
    ? undefined
    : [DT] extends [never]
    ? never
    : DT extends object
    ? {
        [P in keyof DT]: P extends 'transform'
          ? AnimatedTransform
          : AnimatedStyle<DT[P]>
      }
    : DT | AnimatedLeaf<T>
  : never

type Indices<T> = Extract<keyof T, number>

type TransformArray = Exclude<ViewStyle['transform'], void>

// An animated array of transform objects
type AnimatedTransform = {
  [P in Indices<TransformArray>]: TransformArray[P] extends infer T
    ? { [P in keyof T]: T[P] | AnimatedLeaf<T[P]> }
    : never
}

// An animated value that is not an object
type AnimatedLeaf<T> = [T] extends [object]
  ? never
  : SpringValue<Exclude<T, object | void>>
