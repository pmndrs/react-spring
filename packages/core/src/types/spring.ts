import {
  Any,
  Animatable,
  Falsy,
  Indexable,
  OneOrMore,
  UnknownProps,
  FluidValue,
  FluidProps,
} from 'shared'

import { AnimationProps, AnimationEvents } from './animated'
import { Controller, ControllerProps } from '../Controller'
import { AnimationConfig } from '../AnimationConfig'
import { SpringValue } from '../SpringValue'
import { AsyncResult } from '../runAsync'

/** Map an object type to allow `SpringValue` for any property */
export type Springify<T> = Indexable<SpringValue<unknown> | undefined> &
  { [P in keyof T]: T[P] | SpringValue<T[P]> }

/**
 * The set of `SpringValue` objects returned by a `useSpring` call (or similar).
 */
export type SpringValues<T extends object = any> = [T] extends [Any]
  ? Indexable<SpringValue<unknown> | undefined> // Special case: "any"
  : { [P in keyof T]: SpringWrap<T[P]> }

// Wrap a type with `SpringValue`
type SpringWrap<T> = [
  Exclude<T, FluidValue>,
  Extract<T, readonly any[]> // Arrays are animated.
] extends [object | void, never]
  ? never // Object literals cannot be animated.
  : SpringValue<Exclude<T, FluidValue | void>> | Extract<T, void>

/**
 * A value or set of values that can be animated from/to.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type GoalValue<T> = T extends Animatable
  ? T | FluidValue<T> | UnknownProps
  : T extends object
  ? FluidProps<Partial<T>>
  : never

/**
 * The `to` prop's possible types.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type ToProp<T> = GoalValue<T> | AsyncTo<T> | Falsy

/**
 * The `from` prop's possible types.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type FromProp<T> = GoalValue<T> | Falsy

/**
 * The `from` and `to` props.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface RangeProps<T = any> {
  /**
   * The start values of the first animations.
   *
   * The `reset` prop also uses these values.
   */
  from?: FromProp<T>
  /**
   * The end values of the next animations.
   *
   *     to: { width: 100, height: 100 }
   *
   * ---
   * To chain animations together, pass an array of updates:
   *
   *     to: [{ width: 100 }, { width: 0, delay: 100 }]
   *
   * ---
   * For scripted animations, pass an async function:
   *
   *     to: async (update) => {
   *       await update({ width: 100 })
   *       await update({ width: 0, delay: 100 })
   *     }
   */
  to?: ToProp<T>
}

/**
 * The props of a `useSpring` call or its async `update` function.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdate<T = any> = AnimationProps & RangeProps<T>

/**
 * The parameter types of an async `update` function.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type AsyncUpdate<T = any, P extends string = string> =
  | SpringTo<T, P>
  | (SpringUpdate<T> &
      AnimationEvents &
      (T extends object
        ? T extends ReadonlyArray<any>
          ? unknown
          : FluidProps<Partial<T>>
        : unknown))

export type SpringTo<T = any, P extends string = string> = unknown &
  ([T] extends [Animatable] ? T | FluidValue<T> | AsyncTo<T, P> : never)

/**
 * The `to` prop in async form.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type AsyncTo<T, P extends string = string> =
  | AsyncUpdateFn<T>
  // HACK: Wrap a generic mapped type around "SpringUpdate" to allow circular types.
  | ReadonlyArray<{ [U in P]: AsyncUpdate<T, P> }[P]>
  // HACK: Fix type inference of untyped inline functions.
  | Function

/**
 * An async function that can update or cancel the animations of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type AsyncUpdateFn<T = unknown> = (
  next: SpringUpdateFn<T>,
  stop: SpringStopFn<T>
) => Promise<void> | undefined

/**
 * Update the props of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdateFn<T = unknown> = [T] extends [Animatable]
  ? {
      (to: SpringTo<T>, props?: SpringUpdate<T>): AsyncResult<T>
      (props: SpringUpdate<T>): AsyncResult<T>
    }
  : [T] extends [object]
  ? (props: ControllerProps<T>) => AsyncResult<T>
  : (props: SpringUpdate<T>) => AsyncResult<T>

export type SpringUpdates<State extends Indexable = UnknownProps> =
  | OneOrMore<ControllerProps<State>>
  | ((index: number, ctrl: Controller<State>) => ControllerProps<State> | null)

/**
 * Update the props of each spring, individually or all at once.
 *
 * The `T` parameter should only contain animated props.
 */
export type SpringsUpdateFn<T extends Indexable = UnknownProps> = unknown &
  ((props: SpringUpdates<T>) => SpringHandle<T>)

/**
 * Start the animation described by the `props` argument.
 *
 * If nothing is passed, flush the `update` queue.
 */
export type SpringStartFn<State = unknown> = (
  props?: SpringUpdates<State> | null
) => AsyncResult<State[]>

/**
 * Stop every animating `SpringValue` at its current value.
 *
 * Pass one or more keys to stop selectively.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringStopFn<T = unknown> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * Pause animating `SpringValue`.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringPauseFn<T = unknown> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * Resume paused `SpringValue`.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringResumeFn<T = unknown> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * The object attached to the `ref` prop by the `useSprings` hook.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringHandle<T extends Indexable = UnknownProps> {
  controllers: ReadonlyArray<Controller<T>>
  update: SpringsUpdateFn<T>
  start: SpringStartFn<T>
  stop: SpringStopFn<T>
  pause: SpringPauseFn<T>
  resume: SpringResumeFn<T>
}

/**
 * The object type of the `config` prop.
 */
export type SpringConfig = Partial<AnimationConfig>
