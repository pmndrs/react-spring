import {
  Animatable,
  EasingFunction,
  Falsy,
  Indexable,
  OneOrMore,
  UnknownPartial,
  UnknownProps,
  FluidValue,
  Remap,
} from 'shared'
import { Controller, ControllerProps } from '../Controller'
import { SpringValue } from '../SpringValue'
import { AsyncResult } from '../runAsync'
import { AnimationProps, AnimationEvents } from './animated'
import { PickAnimated } from './common'

export { Animatable }

/**
 * The set of `SpringValue` objects returned by a `useSpring` call (or similar).
 */
export type SpringValues<Props extends object = Indexable> = Remap<
  Indexable<SpringValue | undefined> &
    (PickAnimated<Props> extends infer T
      ? {} extends Required<T>
        ? unknown
        : {
            [P in keyof T & string]:
              | SpringValue<Exclude<T[P], void>>
              | Extract<T[P], void>
          }
      : never)
>

/**
 * The `to` prop in async form.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type AsyncTo<T, P extends string = string> =
  // HACK: Wrap a generic mapped type around "SpringUpdate" to allow circular types.
  ReadonlyArray<{ [U in P]: SpringUpdate<T, P> }[P]> | SpringAsyncFn<T>

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
export type SpringProps<T = any> = AnimationProps & RangeProps<T>

/** Add the `FluidValue` type to every property */
export type FluidProps<T> = T extends object
  ? { [P in keyof T]: T[P] | FluidValue<T[P]> }
  : unknown

/**
 * An update to the props of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdate<T = any, P extends string = string> =
  | SpringProps<T> & AnimationEvents
  | SpringTo<T, P>

export type SpringTo<T = any, P extends string = string> = unknown &
  ([T] extends [Animatable] ? T | FluidValue<T> | AsyncTo<T, P> : never)

/**
 * Update the props of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringUpdateFn<T> = [T] extends [Animatable]
  ? {
      (to: SpringTo<T>, props?: SpringProps<T>): AsyncResult<T>
      (props: SpringProps<T>): AsyncResult<T>
    }
  : [T] extends [object]
  ? {
      (props: ControllerProps<T>): AsyncResult<T>
    }
  : {
      (props: SpringProps<T>): AsyncResult<T>
    }

/**
 * Stop every animating `SpringValue` at its current value.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export type SpringStopFn<T> = T extends object
  ? T extends ReadonlyArray<number | string>
    ? (() => void)
    : ((keys?: OneOrMore<string>) => void)
  : (() => void)

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
 * An async function that can update or cancel the animations of a spring.
 *
 * The `T` parameter can be a set of animated values (as an object type)
 * or a primitive type for a single animated value.
 */
export interface SpringAsyncFn<T> {
  (next: SpringUpdateFn<T>, stop: SpringStopFn<T>): Promise<void> | undefined
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

export interface SpringConfig {
  /**
   * Higher mass means more friction is required to slow down.
   *
   * Defaults to 1, which works fine most of the time.
   */
  mass?: number
  /**
   * With higher tension, the spring will resist bouncing and try harder to stop at its end value.
   *
   * When tension is zero, no animation occurs.
   */
  tension?: number
  /**
   * The frequency response.
   *
   * An alternative to `tension` that describes the speed of an undamped spring.
   */
  speed?: number
  /**
   * The damping ratio coefficient, or just the damping ratio when `speed` is defined.
   *
   * When `speed` is defined, this value should be between 0 and 1.
   *
   * Higher friction means the spring will slow down faster.
   */
  friction?: number
  /**
   * The initial velocity of one or more values.
   */
  velocity?: number | number[]
  /**
   * The smallest velocity before the animation is considered "not moving".
   *
   * When undefined, `precision` is used instead.
   */
  restVelocity?: number
  /**
   * The coefficient of restitution.
   *
   * When `true` or `0`, the spring avoids overshooting by ending abruptly at its
   * final value.
   *
   * When a positive number, the spring bounces instead of overshooting. The
   * number is used to multiply the inverted velocity. So a value of `0.5` would
   * chop the velocity in half on each bounce.
   */
  clamp?: number | boolean
  /**
   * The smallest distance from a value before that distance is essentially zero.
   *
   * This helps in deciding when a spring is "at rest". The spring must be within
   * this distance from its final value, and its velocity must be lower than this
   * value too (unless `restVelocity` is defined).
   */
  precision?: number
  decay?: number | boolean
  progress?: number
  duration?: number
  easing?: EasingFunction
}
