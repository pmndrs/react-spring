import { Animatable, Indexable, EasingFunction } from 'shared'
import {
  Merge,
  OneOrMore,
  PickAnimated,
  Remap,
  StringKeys,
  UnknownProps,
} from './common'
import { Controller } from '../Controller'
import { Spring, OnStart, OnRest, OnChange } from '../Spring'

export { Animatable }

/**
 * The map of `Animated` objects passed into `animated()` components.
 *
 * The `T` parameter is the props object passed to `useSpring` or similar.
 */
export type SpringValues<T extends object> = AnimationValues<PickAnimated<T>>

/**
 * The map of `Animated` objects passed into `animated()` components.
 *
 * The `T` parameter should only contain animated props.
 */
export type AnimationValues<T extends object> = Remap<
  { [key: string]: Spring<any> } & ({} extends Required<T>
    ? unknown
    : { [P in keyof T]: Spring<Exclude<T[P], void>> })
>

export interface SpringStopFn<T extends object = any> {
  /** Stop the animations and delays of the given keys */
  (...keys: StringKeys<T>[]): void
}

/**
 * An imperative update to the props of a spring.
 *
 * The `T` parameter should only contain animated props.
 */
export type SpringUpdate<T extends object = {}> = Partial<T> &
  SpringProps<{ to: T }> &
  UnknownProps

/**
 * Imperative API for updating the props of a spring.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringUpdateFn<T extends object = {}> {
  /** Update the props of a spring */
  (props: SpringUpdate<T>): Promise<void>
}

/**
 * Imperative API for the useSprings hook, allowing to update individually or over the array
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringsUpdateFn<T extends object = {}> {
  /** Update the props of a spring */
  (
    props:
      | SpringUpdate<T>
      | SpringUpdate<T>[]
      | ((index: number, spring: Controller<T>) => SpringUpdate<T>)
  ): void
}

/**
 * An async function that can update or cancel the animations of a spring.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringAsyncFn<T extends object = {}> {
  (next: SpringUpdateFn<T>, stop: SpringStopFn<T>): Promise<void>
}

/**
 * Imperative animation controller
 *
 * Created by `useSpring` or `useSprings` for the `ref` prop
 */
export interface SpringHandle {
  /** Start any pending animations */
  start: () => void
  /** Stop one or more animations */
  stop: SpringStopFn
}

/** Spring animation config */
export interface SpringConfig {
  mass?: number
  tension?: number
  friction?: number
  velocity?: number | number[]
  clamp?: number | boolean
  precision?: number
  delay?: number
  decay?: number | boolean
  progress?: number
  duration?: number
  easing?: EasingFunction
}

/**
 * Animation-related props
 *
 * The `T` parameter is the props object passed to `useSpring` or similar.
 */
export type SpringProps<T extends object> = Merge<
  AnimationProps<PickAnimated<T>>,
  AnimationEvents<PickAnimated<T>>
>

type UnknownPartial<T extends object> = UnknownProps & Partial<T>

/**
 * The `to` prop type.
 *
 * The `T` parameter should only contain animated props.
 */
export type ToProp<T extends object = {}> =
  | UnknownPartial<T>
  | ReadonlyArray<UnknownPartial<T> & AnimationProps<T>>
  | SpringAsyncFn<T>

/**
 * Animation-related props
 *
 * The `T` parameter should only contain animated props.
 *
 * Note: The `onFrame` and `onRest` props do *not* have entirely accurate
 * argument types, because the ambiguity helps with inference.
 */
export interface AnimationProps<T extends object = Indexable>
  extends AnimationEvents {
  /**
   * Configure the spring behavior for each key.
   */
  config?: SpringConfig | ((key: keyof T) => SpringConfig)
  /**
   * Milliseconds to wait before applying the other props.
   */
  delay?: number | ((key: keyof T) => number)
  /**
   * When true, props jump to their goal values instead of animating.
   */
  immediate?: boolean | ((key: keyof T) => boolean)
  /**
   * Cancel all animations by using `true`, or some animations by using a key
   * or an array of keys.
   */
  cancel?: boolean | OneOrMore<keyof T>
  /**
   * Start the next animations at their values in the `from` prop.
   */
  reset?: boolean
  /**
   * Swap the `to` and `from` props.
   */
  reverse?: boolean
  /**
   * Prevent an update from being cancelled.
   */
  force?: boolean
}

/**
 * The event props of an animation.
 *
 * The `T` parameter should only contain animated props.
 */
export interface AnimationEvents<T extends object = {}> {
  /**
   * Called when a controller is told to animate
   */
  onAnimate?: (
    props: AnimationProps<T & UnknownProps>,
    controller: Controller<T & UnknownProps>
  ) => void
  /**
   * Called when an animation is about to start
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
  /**
   * Called on every frame when animations are active
   */
  onFrame?: (currentValues: Readonly<T & UnknownProps>) => void
}
