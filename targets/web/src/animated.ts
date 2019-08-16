import { withAnimated, extendAnimated } from '@react-spring/animated'
import { CSSProperties, ForwardRefExoticComponent } from 'react'
import { SpringValue, ElementType, ComponentPropsWithRef } from 'shared'
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
  AnimatedProps<ComponentPropsWithRef<T>> & {
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

type CSSPropertyNames = keyof CSSProperties
type CSSValidProperties<T extends object> = {
  [P in keyof T & CSSPropertyNames]: T[P] extends CSSProperties[P] ? P : never
}[keyof T & CSSPropertyNames]

// The animated prop value of a React element
type AnimatedProp<T> = [T, T] extends [infer T, infer DT]
  ? [DT] extends [never]
    ? never
    : DT extends void
    ? undefined
    : DT extends object
    ? [CSSValidProperties<DT>] extends [never]
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
      ? [CSSValidProperties<DT>] extends [never]
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
