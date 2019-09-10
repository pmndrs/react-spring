import { AnimatedParent } from '@react-spring/animated'
import {
  Animatable,
  EasingFunction,
  Falsy,
  Indexable,
  OneOrMore,
  UnknownPartial,
  UnknownProps,
} from 'shared'
import { AnimationResult, SpringValue } from '../SpringValue'
import { AnimationProps } from './animated'
import { PickAnimated } from './common'
import { Controller } from '../Controller'

export { Animatable }

/**
 * The set of `SpringValue` objects returned by a `useSpring` call (or similar).
 */
export type SpringValues<Props extends object> = Indexable<
  SpringValue | undefined
> &
  (PickAnimated<Props> extends infer T
    ? {} extends Required<T>
      ? unknown
      : {
          [P in keyof T & string]:
            | SpringValue<Exclude<T[P], void>, P>
            | Extract<T[P], void>
        }
    : never)

/**
 * The `to` prop in async form.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type AsyncTo<T, P extends string = string> =
  | ReadonlyArray<SpringUpdate<T, P>>
  | SpringAsyncFn<T, P>

/**
 * A value or set of values that can be animated from/to.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type GoalValue<T, P extends string = string> = Animatable<
  T
> extends infer Value
  ? [Value] extends [never]
    ? UnknownPartial<T>
    :
        | Value
        | AnimatedParent<Value>
        | { [K in P]: Value | AnimatedParent<Value> }
  : never

/**
 * The `to` prop's possible types.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type ToProp<T, P extends string = string> =
  | GoalValue<T, P>
  | AsyncTo<T, P>
  | Falsy

/**
 * The `from` prop's possible types.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type FromProp<T, P extends string = string> = GoalValue<T, P> | Falsy

/**
 * The `from` and `to` props.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface RangeProps<T = unknown, P extends string = string> {
  /**
   * The start values of the first animations.
   *
   * The `reset` prop also uses these values.
   */
  from?: FromProp<T, P>
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
  to?: ToProp<T, P>
}

/**
 * The props of a `useSpring` call or its async `update` function.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringProps<
  T = unknown,
  P extends string = string
> = AnimationProps<T> &
  RangeProps<T, P> &
  (Animatable<T> extends never ? UnknownPartial<T> : unknown)

/**
 * An update to the props of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdate<T, P extends string = string> = Animatable<
  T
> extends infer Value
  ? [Value] extends [never]
    ? SpringProps<T, P>
    : Value | SpringProps<Value, P>
  : never

/**
 * Update the props of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface SpringUpdateFn<T, P extends string = string> {
  /** Update the props of a spring */
  (props: SpringUpdate<T, P>): Promise<AnimationResult<T>>
}

/**
 * Stop every animating `SpringValue` at its current value.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringStopFn<T> = [T] extends [Animatable]
  ? ((timestamp?: number) => void)
  : ((keys?: OneOrMore<string>) => void)

/**
 * Update the props of each spring, individually or all at once.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringsUpdateFn<T extends Indexable> {
  (
    props:
      | OneOrMore<SpringProps<T>>
      | ((index: number, ctrl: Controller<T>) => SpringProps<T> | null)
  ): SpringsHandle<T>
}

/**
 * An async function that can update or cancel the animations of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface SpringAsyncFn<T, P extends string = string> {
  (next: SpringUpdateFn<T, P>, stop: SpringStopFn<T>): Promise<void>
}

/**
 * The object attached to the `ref` prop by the `useSpring` hook.
 *
 * The `T` parameter must be a set of animated values (as an object type).
 */
export interface SpringHandle<T extends Indexable = UnknownProps> {
  get: () => T & UnknownProps
  controller: Controller<T>
  update: SpringsUpdateFn<T>
  start: () => Promise<AnimationResult<T>>
  stop: SpringStopFn<T>
}

/**
 * The object attached to the `ref` prop by the `useSprings` hook.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringsHandle<T extends Indexable = UnknownProps> {
  get: (i: number) => Controller<T>
  controllers: readonly Controller<T>[]
  update: SpringsUpdateFn<T>
  start: () => Promise<AnimationResult<T[]>>
  stop: SpringStopFn<T>
}

/** Spring animation config */
export interface SpringConfig {
  mass?: number
  tension?: number
  friction?: number
  velocity?: number | number[]
  clamp?: number | boolean
  precision?: number
  decay?: number | boolean
  progress?: number
  duration?: number
  easing?: EasingFunction
}
