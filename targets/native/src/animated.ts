import { ForwardRefExoticComponent, ComponentClass, ReactNode } from 'react'
import { withAnimated, extendAnimated } from 'animated'
import {
  Text,
  View,
  Image,
  ViewProps,
  ViewStyle,
  RecursiveArray,
} from 'react-native'
import {
  AssignableKeys,
  ElementType,
  ComponentPropsWithRef,
  FluidValue,
} from 'shared'

// These are converted into `animated` components
const elements = {
  View: View as ComponentClass<
    // @types/react-native forgot to add "children" to the "View" component??
    ViewProps & { children?: ReactNode }
  >,
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
    : DT extends ReadonlyArray<number | string>
    ? AnimatedArray<DT> | AnimatedLeaf<T>
    : DT extends ReadonlyArray<any>
    ? TransformArray extends DT
      ? AnimatedTransform
      : AnimatedStyles<DT>
    : [AssignableKeys<DT, ViewStyle>] extends [never]
    ? DT | AnimatedLeaf<T>
    : AnimatedStyle<DT>
  : never

type AnimatedArray<T extends ReadonlyArray<number | string>> = {
  [P in keyof T]: T[P] | FluidValue<T[P]>
}

// An animated array of style objects
type AnimatedStyles<T extends ReadonlyArray<any>> = unknown &
  T extends RecursiveArray<infer U>
  ? { [P in keyof T]: RecursiveArray<AnimatedProp<U>> }[keyof T]
  : {
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
        [P in keyof T]: P extends 'transform'
          ? AnimatedTransform
          : AnimatedStyle<T[P]>
      }
    : DT | AnimatedLeaf<T>
  : never

type Indices<T> = Extract<keyof T, number>

type TransformArray = Exclude<ViewStyle['transform'], void>

// An animated array of transform objects
export type AnimatedTransform = {
  [P in Indices<TransformArray>]: TransformArray[P] extends infer T
    ? { [P in keyof T]: T[P] | AnimatedLeaf<T[P]> }
    : never
}

// An animated primitive (or an array of them)
type AnimatedLeaf<T> =
  | Exclude<T, object | void>
  | Extract<T, ReadonlyArray<number | string>> extends infer U
  ? [U] extends [never]
    ? never
    : FluidValue<U>
  : never
