import { Animatable, FluidValue, EasingFunction } from 'shared'
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
  /** @internal */
  w0: number
  /**
   * Higher mass means more friction is required to slow down.
   *
   * Defaults to 1, which works fine most of the time.
   */
  mass: number
  /**
   * With higher tension, the spring will resist bouncing and try harder to stop at its end value.
   *
   * When tension is zero, no animation occurs.
   */
  tension: number
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
  friction: number
  /**
   * The initial velocity of one or more values.
   */
  velocity: number | number[]
  /**
   * The smallest velocity before the animation is considered "not moving".
   *
   * When undefined, `precision` is used instead.
   */
  restVelocity?: number
  /**
   * The smallest distance from a value before that distance is essentially zero.
   *
   * This helps in deciding when a spring is "at rest". The spring must be within
   * this distance from its final value, and its velocity must be lower than this
   * value too (unless `restVelocity` is defined).
   */
  precision?: number
  /**
   * For `duration` animations only. Note: The `duration` is not affected
   * by this property.
   *
   * Defaults to `0`, which means "start from the beginning".
   *
   * Setting to `1+` makes an immediate animation.
   *
   * Setting to `0.5` means "start from the middle of the easing function".
   *
   * Any number `>= 0` and `<= 1` makes sense here.
   */
  progress: number
  /**
   * Animation length in number of milliseconds.
   */
  duration?: number
  /**
   * The animation curve.
   */
  easing: EasingFunction
  /**
   * Avoid overshooting by ending abruptly at the goal value.
   */
  clamp?: boolean
  /**
   * When above zero, the spring will bounce instead of overshooting when
   * exceeding its goal value. Its velocity is multiplied by `-1 + bounce`
   * whenever its current value equals or exceeds its goal. For example,
   * setting `bounce` to `0.5` chops the velocity in half on each bounce,
   * in addition to any friction.
   */
  bounce?: number
  /**
   * "Decay animations" decelerate without an explicit goal value.
   * Useful for scrolling animations.
   *
   * Use `true` for the default exponential decay factor (`0.998`).
   *
   * When a `number` between `0` and `1` is given, a lower number makes the
   * animation slow down faster. And setting to `1` would make an unending
   * animation.
   */
  decay?: boolean | number
  /**
   * Round to the nearest multiple of `step`.
   */
  step?: number
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
