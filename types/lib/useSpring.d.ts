import { SpringValues } from './animated'
import {
  PickAnimated,
  UnknownProps,
  AnimationProps,
  AnimationEvents,
  SpringProps,
  OneOrMore,
  Merge,
} from './common'
import { RefObject } from 'react'

export function useSpring<Props extends object>(
  props: () => Props & UseSpringProps<Props>
): [SpringValues<Props>, SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export function useSpring<Props extends object>(
  props: Props extends Function ? UseSpringProps : Props & UseSpringProps<Props>
): SpringValues<Props>

/**
 * The props that `useSpring` recognizes.
 */
export interface UseSpringProps<Props extends object = {}>
  extends AnimationProps {
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
  from?: Partial<PickAnimated<Props>>
  /**
   * The end values of the current animations.
   *
   * As an array, it creates a chain of animations.
   *
   * As an async function, it can create animations on-the-fly.
   */
  to?: ToProp
}

type UnknownPartial<T extends object> = UnknownProps & Partial<T>

/**
 * The `to` prop type.
 *
 * The `T` parameter should only contain animated props.
 */
export type ToProp<T extends object = {}> =
  | UnknownPartial<T>
  | ReadonlyArray<UnknownPartial<T> & AnimationProps<T>>
  | SpringAsyncFn<T>

export interface SpringStopFn {
  /** Stop all animations and delays */
  (finished?: boolean): void
  /** Stop the animations and delays of the given keys */
  (...keys: string[]): void
  /** Stop the animations and delays of the given keys */
  (finished: boolean, ...keys: string[]): void
}

/**
 * An imperative update to the props of a spring.
 *
 * The `T` parameter should only contain animated props.
 */
export type SpringUpdate<T extends object = {}> = Partial<T> &
  SpringProps<{ to: T }> &
  UnknownProps

/**
 * Imperative API for updating the props of a spring.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringUpdateFn<T extends object = {}> {
  /** Update the props of a spring */
  (props: SpringUpdate<T>): void
}

/**
 * An async function that can update or cancel the animations of a spring.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringAsyncFn<T extends object = {}> {
  (next: SpringUpdateFn<T>, stop: SpringStopFn): Promise<void>
}

/**
 * Imperative animation controller
 *
 * Created by `useSpring` or `useSprings` for the `ref` prop
 */
export interface SpringHandle {
  /** Start any pending animations */
  start: () => void
  /** Stop one or more animations */
  stop: SpringStopFn
}
