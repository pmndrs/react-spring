import {
  Any,
  Animatable,
  Falsy,
  Indexable,
  OneOrMore,
  UnknownPartial,
  UnknownProps,
  FluidValue,
  FluidProps,
  Remap,
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
export type SpringValues<T extends object = any> = Remap<
  Indexable<SpringValue<unknown> | undefined> &
    ([T] extends [Any]
      ? unknown // Ignore "T = any"
      : { [P in keyof T]: SpringWrap<T[P]> })
>

// Wrap a type with `SpringValue`
type SpringWrap<T> = [Exclude<T, FluidValue>] extends [object | void]
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
  ? UnknownPartial<FluidProps<T>>
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
          : UnknownProps
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
  // HACK: Wrap a generic mapped type around "SpringUpdate" to allow circular types.
  ReadonlyArray<{ [U in P]: AsyncUpdate<T, P> }[P]> | AsyncUpdateFn<T>

/**
 * Update the props of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdateFn<T> = [T] extends [Animatable]
  ? {
      (to: SpringTo<T>, props?: SpringUpdate<T>): AsyncResult<T>
      (props: SpringUpdate<T>): AsyncResult<T>
    }
  : [T] extends [object]
  ? {
      (props: ControllerProps<T>): AsyncResult<T>
    }
  : {
      (props: SpringUpdate<T>): AsyncResult<T>
    }

/**
 * An async function that can update or cancel the animations of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface AsyncUpdateFn<T> {
  (next: SpringUpdateFn<T>, stop: SpringStopFn<T>): Promise<void> | undefined
}

/**
 * Stop every animating `SpringValue` at its current value.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringStopFn<T> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? () => void
    : (keys?: OneOrMore<string>) => void
  : () => void

/**
 * Update the props of each spring, individually or all at once.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringsUpdateFn<State extends Indexable> {
  (
    props:
      | OneOrMore<ControllerProps<State>>
      | ((
          index: number,
          ctrl: Controller<State>
        ) => ControllerProps<State> | null)
  ): SpringHandle<State>
}

/**
 * The object attached to the `ref` prop by the `useSprings` hook.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringHandle<T extends Indexable = any> {
  controllers: readonly Controller<T>[]
  update: SpringsUpdateFn<T>
  start: () => AsyncResult<T[]>
  stop: SpringStopFn<T>
}

export type SpringConfig = Partial<Omit<AnimationConfig, 'w0'>>
