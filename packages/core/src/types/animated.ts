import { Animatable, FluidValue } from 'shared'
import { AnimatedArray, AnimatedValue } from '@react-spring/animated'
import { OnStart, OnRest, OnChange, OnAnimate } from '../SpringValue'
import { SpringConfig } from './spring'
import { UnknownProps } from './common'
import { MatchProp } from '../helpers'

export type AnimatedNode<T> =
  | AnimatedValue<T>
  | (T extends ReadonlyArray<any> ? AnimatedArray<T> : never)

export type AnimatedType<T> = Function & {
  create: (from: any, goal?: any) => AnimatedNode<T>
}

export type AnimationRange<T> = {
  to: T | FluidValue<T> | undefined
  from: T | FluidValue<T> | undefined
}

/**
 * Animation-related props
 *
 * The `T` parameter can be a set of animated properties (as an object type)
 * or a primitive type for a single animated value.
 */
export interface AnimationProps<T = unknown> extends AnimationEvents<T> {
  /**
   * Configure the spring behavior for each key.
   */
  config?: SpringConfig | ((key: string) => SpringConfig)
  /**
   * Milliseconds to wait before applying the other props.
   */
  delay?: number | ((key: string) => number)
  /**
   * When true, props jump to their goal values instead of animating.
   */
  immediate?: MatchProp
  /**
   * Cancel all animations by using `true`, or some animations by using a key
   * or an array of keys.
   */
  cancel?: MatchProp
  /**
   * Start the next animations at their values in the `from` prop.
   */
  reset?: MatchProp
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
 * The event props of an animation.
 *
 * The `T` parameter can be a set of animated properties (as an object type)
 * or a primitive type for a single animated value.
 */
export type AnimationEvents<T = unknown> = {
  /**
   * Called when a controller is told to animate
   */
  onAnimate?: OnAnimate<Animate<T>>
  /**
   * Called when an animation is about to start
   */
  onStart?: OnStart<Animate<T>>
  /**
   * Called when all animations come to a stand-still
   */
  onRest?: OnRest<Animate<T>>
  /**
   * Called when a key/value pair is changed
   */
  onChange?: OnChange<Animate<T>>
  /**
   * Called on every frame when animations are active
   */
  onFrame?: [T] extends [Animatable]
    ? never
    : (frame: UnknownProps & Partial<T>) => void
}

/** Force a type to be animatable */
export type Animate<T> = [T] extends [Animatable] ? Animatable<T> : Animatable
