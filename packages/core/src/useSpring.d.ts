import { RefObject } from 'react'
import {
  PickAnimated,
  UnknownProps,
  OneOrMore,
  Merge,
  Falsy,
} from './types/common'
import {
  ToProp,
  SpringProps,
  SpringValues,
  SpringHandle,
  SpringAsyncFn,
  SpringUpdateFn,
  SpringStopFn,
  AnimationProps,
  AnimationEvents,
} from './types/spring'

export declare function useSpring<Props extends object>(
  props: () => Props & UseSpringProps<Props>
): [SpringValues<Props>, SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export declare function useSpring<Props extends object>(
  props: Props extends Function ? UseSpringProps : Props & UseSpringProps<Props>
): SpringValues<Props>

/**
 * The props that `useSpring` recognizes.
 */
export interface UseSpringProps<Props extends object = {}>
  extends AnimationProps,
    InferProps<Props> {}

export interface InferProps<Props extends object = {}> {
  /**
   * Used to access the imperative API.
   *
   * Animations never auto-start when `ref` is defined.
   */
  ref?: RefObject<SpringHandle>
  /**
   * The start values of the first animations.
   *
   * The `reset` prop also uses these values.
   */
  from?: Partial<PickAnimated<Props>> | Falsy
  /**
   * The end values of the current animations.
   *
   * As an array, it creates a chain of animations.
   *
   * As an async function, it can create animations on-the-fly.
   */
  to?: ToProp | Falsy
}
