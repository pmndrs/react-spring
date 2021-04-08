import type { FluidValue } from '@react-spring/shared'
import type { Lookup, Any } from '@react-spring/types'
import type { AnimationConfig } from '../AnimationConfig'
import type { SpringValue } from '../SpringValue'
import type { Readable } from './internal'

/** The object type of the `config` prop. */
export type SpringConfig = Partial<AnimationConfig>

/** The object given to the `onRest` prop and `start` promise. */
export interface AnimationResult<T extends Readable = any> {
  value: T extends Readable<infer U> ? U : never
  /** When true, no animation ever started. */
  noop?: boolean
  /** When true, the animation was neither cancelled nor stopped prematurely. */
  finished?: boolean
  /** When true, the animation was cancelled before it could finish. */
  cancelled?: boolean
}

/** The promised result of an animation. */
export type AsyncResult<T extends Readable = any> = Promise<AnimationResult<T>>

/** Map an object type to allow `SpringValue` for any property */
export type Springify<T> = Lookup<SpringValue<unknown> | undefined> &
  { [P in keyof T]: T[P] | SpringValue<T[P]> }

/**
 * The set of `SpringValue` objects returned by a `useSpring` call (or similar).
 */
export type SpringValues<T extends Lookup = any> = [T] extends [Any]
  ? Lookup<SpringValue<unknown> | undefined> // Special case: "any"
  : { [P in keyof T]: SpringWrap<T[P]> }

// Wrap a type with `SpringValue`
type SpringWrap<T> = [
  Exclude<T, FluidValue>,
  Extract<T, readonly any[]> // Arrays are animated.
] extends [object | void, never]
  ? never // Object literals cannot be animated.
  : SpringValue<Exclude<T, FluidValue | void>> | Extract<T, void>
