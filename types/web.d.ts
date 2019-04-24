import { AnimatedStyle, AnimatedValue, Solve } from './lib/common'
import {
  ReactType,
  CSSProperties,
  ComponentPropsWithRef,
  ForwardRefExoticComponent,
} from 'react'

export * from './lib/useSpring'
export * from './lib/useSprings'
export * from './lib/useTransition'
export * from './lib/useTrail'
export * from './lib/useChain'
export * from './lib/render-props'

export {
  config,
  AnimatedValue,
  AnimatedStyle,
  SpringConfig,
  TransitionPhase,
} from './lib/common'

/** Create a HOC that accepts `AnimatedValue` props */
export const animated: <T extends ReactType>(
  wrappedComponent: T
) => AnimatedComponent<T> &
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
