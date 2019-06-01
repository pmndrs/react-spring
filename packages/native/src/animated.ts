import { View, Text, ViewStyle } from 'react-native'
import { createAnimatedComponent, withExtend } from '@react-spring/animated'
import { AssignableKeys, SpringValue } from 'shared'
import {
  ReactNode,
  ElementType,
  ComponentPropsWithRef,
  ForwardRefExoticComponent,
} from 'react'

export { update } from '../../animated/FrameLoop'

// These are converted into `animated` components
const elements = {
  View,
  Text,
}

type NativeElements = typeof elements
type NativeComponents = {
  [P in keyof NativeElements]: AnimatedComponent<NativeElements[P]>
}

type CreateAnimated = <T extends ElementType>(
  wrappedComponent: T
) => AnimatedComponent<T>

export const animated = withExtend(createAnimatedComponent as CreateAnimated &
  NativeComponents).extend(elements)

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
type AnimatedProp<T> = [T, T] extends [infer T, infer DT] // T is a union, DT is a distributed union
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
  [P in keyof T]: [T[P]] extends [infer DT] // DT is a distributed union
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
type AnimatedStyle<T> = [T, T] extends [infer T, infer DT] // T is a union, DT is a distributed union
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
