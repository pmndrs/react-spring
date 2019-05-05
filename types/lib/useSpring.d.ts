import { SpringValues } from './animated'
import {
  PickAnimated,
  UnknownProps,
  AnimationProps,
  AnimationEvents,
  Merge,
} from './common'
import { RefObject } from 'react'

export function useSpring<Props extends object>(
  props: () => UseSpringProps<Props>
): [SpringValues<Props>, SpringUpdateFn<PickAnimated<Props>>, SpringStopFn]

export function useSpring<Props extends object>(
  props: UseSpringProps<Props>
): SpringValues<Props>

/** The props that `useSpring` recognizes */
export type UseSpringProps<Props extends object = {}> = Props &
  UseSpringBaseProps & {
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
    to?: ToProp<PickAnimated<Props>>
  }

type UnknownPartial<T extends object> = UnknownProps & Partial<T>

type ToProp<T extends object> =
  | UnknownPartial<T>
  | ReadonlyArray<UnknownPartial<T> & UseSpringProps<T>>
  | SpringAsyncFn

/** Static `useSpring` props (use with `extends` or `&`) */
export interface UseSpringBaseProps extends AnimationProps {
  /**
   * Used to access the imperative API.
   *
   * Animations never auto-start when `ref` is defined.
   */
  ref?: RefObject<SpringHandle>
}

export interface SpringStopFn {
  /** Stop all animations and delays */
  (finished?: boolean): void
  /** Stop the animations and delays of the given keys */
  (...keys: string[]): void
  /** Stop the animations and delays of the given keys */
  (finished: boolean, ...keys: string[]): void
}

/** An imperative update to the props of a spring */
export type SpringUpdate<T extends object = {}> = UnknownProps &
  Merge<UseSpringProps<Partial<T>>, AnimationEvents<T>>

/** Imperative API for updating the props of a spring */
export interface SpringUpdateFn<T extends object = {}> {
  /** Update the props of a spring */
  (props: SpringUpdate<T>): void
}

/** An async function that can update or cancel the animations of a spring */
export type SpringAsyncFn<T extends object = {}> = (
  next: SpringUpdateFn<T>,
  stop: SpringStopFn
) => Promise<void>

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
