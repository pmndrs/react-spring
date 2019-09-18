import { Animatable, FluidValue, EasingFunction, AnyKey } from 'shared'
import { AnimatedValue, AnimationValue, OnChange } from '@react-spring/animated'

import { MatchProp } from '../helpers'
import { RunAsyncProps } from '../runAsync'
import { SpringValue } from '../SpringValue'
import { SpringConfig } from './spring'

export type AnimatedType<T> = Function & {
  create: (from: any, goal?: any) => AnimationValue<T>['node']
}

export type AnimationRange<T> = {
  to: T | FluidValue<T> | undefined
  from: T | FluidValue<T> | undefined
}

/** Called before the given props are applied */
export type OnAnimate<T = unknown> = (
  props: RunAsyncProps<T>,
  spring: SpringValue<T>
) => void

/** Called before the animation is added to the frameloop */
export type OnStart<T = unknown> = (spring: SpringValue<T>) => void

/** Called once the animation comes to a halt */
export type OnRest<T = unknown> = (result: AnimationResult<T>) => void

/** The object passed to `onRest` props */
export type AnimationResult<T = any> = Readonly<{
  value: T
  spring?: SpringValue<T>
  /** When falsy, the animation did not reach its end value. */
  finished?: boolean
  /** When true, the animation was cancelled before it could finish. */
  cancelled?: boolean
}>

export interface AnimationConfig {
  w0: number
  mass: number
  tension: number
  speed?: number
  friction: number
  velocity: number | number[]
  restVelocity?: number
  precision?: number
  easing: EasingFunction
  progress: number
  duration?: number
  clamp?: boolean | number
  decay?: boolean | number
}

/** An animation being executed by the frameloop */
export interface Animation<T = unknown> {
  changed: boolean
  values: readonly AnimatedValue[]
  to: T | FluidValue<T>
  toValues: readonly number[] | null
  from: T | FluidValue<T>
  fromValues: readonly number[]
  config: AnimationConfig
  reverse?: boolean
  immediate: boolean
  onStart?: OnStart<T>
  onChange?: OnChange<T>
  onRest?: Array<OnRest<T>>
  owner: SpringValue<T>
}

/**
 * Animation-related props
 *
 * The `T` parameter can be a set of animated properties (as an object type)
 * or a primitive type for a single animated value.
 */
export interface AnimationProps<P extends AnyKey = AnyKey> {
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
   * Swap the `to` and `from` props.
   */
  reverse?: boolean
  /**
   * Override the default props with this update.
   */
  default?: boolean
}

/**
 * The event props of a `SpringValue` animation.
 *
 * The `T` parameter can be a set of animated properties (as an object type)
 * or a primitive type for a single animated value.
 */
export type AnimationEvents<T = unknown> = {
  /**
   * Called when a controller is told to animate
   */
  onAnimate?: OnAnimate<T>
  /**
   * Called when an animation moves for the first time
   */
  onStart?: OnStart<T>
  /**
   * Called when all animations come to a stand-still
   */
  onRest?: OnRest<T>
  /**
   * Called when a key/value pair is changed
   */
  onChange?: OnChange<T>
}

/** Force a type to be animatable */
export type Animate<T> = T extends Animatable ? T : unknown
