import { Animatable, FluidValue, Indexable } from 'shared'

import { MatchProp } from '../helpers'
import { RunAsyncProps } from '../runAsync'
import { SpringValue } from '../SpringValue'
import { SpringConfig } from './spring'

export type Velocity<T = any> = T extends ReadonlyArray<number | string>
  ? number[]
  : number

export type AnimationRange<T> = {
  to: T | FluidValue<T> | undefined
  from: T | FluidValue<T> | undefined
}

/**
 * Called after an animation is updated by new props,
 * even if the animation remains idle.
 */
export type OnProps<T = unknown> = (
  props: Readonly<RunAsyncProps<T>>,
  spring: SpringValue<T>
) => void

/**
 * Called before the first frame of every animation.
 * From inside the `requestAnimationFrame` callback.
 */
export type OnStart<T = unknown> = (spring: SpringValue<T>) => void

/** Called when a `SpringValue` changes */
export type OnChange<T = unknown> = (value: T, source: SpringValue<T>) => void

/** Called once the animation comes to a halt */
export type OnRest<T = unknown> = (result: Readonly<AnimationResult<T>>) => void

/** The object passed to `onRest` props */
export type AnimationResult<T = any> = {
  value: T
  spring?: SpringValue<T>
  /** When falsy, the animation did not reach its end value. */
  finished?: boolean
  /** When true, the animation was cancelled before it could finish. */
  cancelled?: boolean
}

/** Configuration for a looping animation */
export interface AnimationLoop {
  delay?: number
}

/** `SpringProps` without `to` or `from` */
export interface AnimationProps<P extends string = string> {
  /**
   * Configure the spring behavior for each key.
   */
  config?: SpringConfig | ((key: P) => SpringConfig)
  /**
   * Milliseconds to wait before applying the other props.
   */
  delay?: number | ((key: P) => number)
  /**
   * When true, props jump to their goal values instead of animating.
   */
  immediate?: MatchProp<P>
  /**
   * Cancel all animations by using `true`, or some animations by using a key
   * or an array of keys.
   */
  cancel?: MatchProp<P>
  /**
   * Start the next animations at their values in the `from` prop.
   */
  reset?: MatchProp<P>
  /**
   * Replay animations after they're finished.
   */
  loop?: boolean | AnimationLoop | ((key: string) => boolean | AnimationLoop)
  /**
   * Swap the `to` and `from` props.
   */
  reverse?: boolean
  /**
   * Override the default props with this update.
   */
  default?: boolean
}

export type EventProp<T> = T | Indexable<T>

/**
 * The event props of a `SpringValue` animation.
 *
 * The `T` parameter can be a set of animated properties (as an object type)
 * or a primitive type for a single animated value.
 */
export type AnimationEvents<T = unknown> = {
  /**
   * Called after an animation is updated by new props,
   * even if the animation remains idle.
   */
  onProps?: EventProp<OnProps<T>>
  /**
   * Called when an animation moves for the first time.
   */
  onStart?: EventProp<OnStart<T>>
  /**
   * Called when all animations come to a stand-still.
   */
  onRest?: EventProp<OnRest<T>>
  /**
   * Called when a spring has its value changed.
   */
  onChange?: EventProp<OnChange<T>>
}

/** Force a type to be animatable */
export type Animate<T> = T extends Animatable ? T : unknown
