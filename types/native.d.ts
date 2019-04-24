import {
  AnimatedStyle,
  AnimatedValue,
  Solve,
  AnimatedTransform,
} from './lib/common'
import { StyleProp, ViewStyle, View, Text } from 'react-native'
import {
  ReactType,
  ComponentPropsWithRef,
  ForwardRefExoticComponent,
} from 'react'

export * from './lib/useSpring'
export * from './lib/useSprings'
export * from './lib/useTransition'
export * from './lib/useTrail'
export * from './lib/useChain'
export * from './lib/legacy'

export {
  config,
  AnimatedValue,
  AnimatedStyle,
  SpringConfig,
  TransitionPhase,
} from './lib/common'

type CreateAnimated = <T extends ReactType>(
  wrappedComponent: T
) => AnimatedComponent<T>

/** Create a HOC that accepts `AnimatedValue` props */
export const animated: CreateAnimated & {
  View: AnimatedComponent<typeof View>
  Text: AnimatedComponent<typeof Text>
}

/** The type of an `animated()` component */
export type AnimatedComponent<T extends ReactType> = ForwardRefExoticComponent<
  AnimatedProps<ComponentPropsWithRef<T>>
>

/** The props of an `animated()` component */
export type AnimatedProps<Props extends object> = {
  [P in keyof Props]: [Props[P]] extends [infer T]
    ? P extends 'ref'
      ? T
      : [T] extends [infer U]
      ? T extends StyleProp<ViewStyle>
        ? AnimatedStyle<T>
        : T | AnimatedValue<Exclude<U, void>>
      : never
    : never
}
