import {
  Dependency,
  withAnimated,
  extendAnimated,
} from '@react-spring/animated'
import { CSSProperties, ForwardRefExoticComponent } from 'react'
import { AssignableKeys, ComponentPropsWithRef, ElementType } from 'shared'
import * as THREE from 'three'

// TODO: Support type-checking for `animated` props
type ThreeComponents = { [key: string]: ElementType }

const elements = Object.keys(THREE).filter(key => /^[A-Z]/.test(key))

type CreateAnimated = <T extends ElementType>(
  wrappedComponent: T
) => AnimatedComponent<T>

// Extend animated with all the available THREE elements
export const animated: CreateAnimated & ThreeComponents = extendAnimated(
  withAnimated,
  [...elements, 'primitive'],
  true
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

// An animated value that is not an object
type AnimatedLeaf<T> = [T] extends [object]
  ? never
  : Dependency<Exclude<T, object | void>>
