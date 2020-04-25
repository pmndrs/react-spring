import { Lookup, FluidValue, Any, UnknownProps } from 'shared'
import { AnimationConfig } from '../AnimationConfig'
import { SpringValue } from '../SpringValue'
import { Controller } from '../Controller'
import {
  SpringsUpdateFn,
  SpringStartFn,
  SpringStopFn,
  SpringPauseFn,
  SpringResumeFn,
} from './functions'

/** The object type of the `config` prop. */
export type SpringConfig = Partial<AnimationConfig>

/** @internal */
export interface AnimationRange<T> {
  to: T | FluidValue<T> | undefined
  from: T | FluidValue<T> | undefined
}

/** The object given to the `onRest` prop and `start` promise. */
export interface AnimationResult<T = any> {
  value: T
  spring?: SpringValue<T>
  /** When true, no animation ever started. */
  noop?: boolean
  /** When true, the animation was neither cancelled nor stopped prematurely. */
  finished?: boolean
  /** When true, the animation was cancelled before it could finish. */
  cancelled?: boolean
}

/** The promised result of an animation. */
export type AsyncResult<T = any> = Promise<Readonly<AnimationResult<T>>>

/** Map an object type to allow `SpringValue` for any property */
export type Springify<T> = Lookup<SpringValue<unknown> | undefined> &
  { [P in keyof T]: T[P] | SpringValue<T[P]> }

/**
 * The set of `SpringValue` objects returned by a `useSpring` call (or similar).
 */
export type SpringValues<T extends object = any> = [T] extends [Any]
  ? Lookup<SpringValue<unknown> | undefined> // Special case: "any"
  : { [P in keyof T]: SpringWrap<T[P]> }

// Wrap a type with `SpringValue`
type SpringWrap<T> = [
  Exclude<T, FluidValue>,
  Extract<T, readonly any[]> // Arrays are animated.
] extends [object | void, never]
  ? never // Object literals cannot be animated.
  : SpringValue<Exclude<T, FluidValue | void>> | Extract<T, void>

/**
 * The object attached to the `ref` prop by the `useSprings` hook.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringHandle<T extends Lookup = UnknownProps> {
  controllers: ReadonlyArray<Controller<T>>
  update: SpringsUpdateFn<T>
  start: SpringStartFn<T>
  stop: SpringStopFn<T>
  pause: SpringPauseFn<T>
  resume: SpringResumeFn<T>
}
