import { AnimatedStyle, AnimatedValue, Solve } from './lib/common'
import {
  ReactType,
  CSSProperties,
  ComponentPropsWithRef,
  ForwardRefExoticComponent,
} from 'react'

export * from './universal'

type CreateAnimated = <T extends ReactType>(
  wrappedComponent: T
) => AnimatedComponent<T>

/** Create a HOC that accepts `AnimatedValue` props */
export const animated: CreateAnimated &
  { [Tag in keyof JSX.IntrinsicElements]: AnimatedComponent<Tag> }

/** The type of an `animated()` component */
export type AnimatedComponent<T extends ReactType> = ForwardRefExoticComponent<
  AnimatedProps<ComponentPropsWithRef<T>>
>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = Solve<
  { [P in keyof Props]: AnimatedProp<Props, P> }
>

type AnimatedProp<
  Props extends object,
  P extends keyof Props
> = Props[P] extends infer T
  ? P extends 'ref'
    ? T
    : P extends 'style'
    ? AnimatedStyle<T>
    : T extends CSSProperties
    ? AnimatedStyle<T>
    : T | AnimatedValue<Exclude<T, void>>
  : never
