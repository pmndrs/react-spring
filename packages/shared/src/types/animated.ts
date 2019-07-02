import {
  Interpolator,
  ExtrapolateType,
  InterpolatorConfig,
} from './interpolation'
import { Arrify, OneOrMore } from './common'

/** These types can be animated */
export type Animatable<T = any> = T extends number
  ? number
  : T extends string
  ? string
  : T extends ReadonlyArray<any>
  ? ReadonlyArray<any> extends T // When true, T is not a tuple
    ? ReadonlyArray<number | string>
    : { [P in keyof T]: Animatable<T[P]> }
  : never

/** An animated value which can be passed into an `animated` component */
export interface SpringValue<T = any> {
  /**
   * Get the animated value. Automatically invoked when an `AnimatedValue`
   * is assigned to a property of an `animated` element.
   */
  getValue(): T
  /**
   * Interpolate the value with a custom interpolation function,
   * a configuration object, or keyframe-like ranges.
   *
   * @example
   *
   * value.to(alpha => `rgba(255, 165, 0, ${alpha})`)
   * value.to({ range: [0, 1], output: ['yellow', 'red'], extrapolate: 'clamp' })
   * value.to([0, 0.25, 1], ['yellow', 'orange', 'red'])
   */
  to: Interpolator<Arrify<T>>
  /**
   * @deprecated Use the `to` method instead. This will be removed in v10.
   */
  interpolate: Interpolator<Arrify<T>>
}

// Extract the raw value types that are being animated
export type RawValues<T extends ReadonlyArray<any>> = {
  [P in keyof T]: T[P] extends { getValue(): infer U } ? U : never
}

export interface FrameRequestCallback {
  (time: number): void
}

/**
 * This interpolates one or more `SpringValue` objects.
 * The exported `interpolate` function uses this type.
 */
export interface SpringInterpolator {
  // Single AnimatedValue parent
  <In extends Animatable, Out extends Animatable>(
    parent: SpringValue<In>,
    interpolator: (...args: Arrify<In>) => Out
  ): SpringValue<Out>

  // Tuple of AnimatedValue parents
  <In extends ReadonlyArray<SpringValue>, Out extends Animatable>(
    parents: In,
    interpolator: (...args: RawValues<In>) => Out
  ): SpringValue<Out>

  // Interpolation config
  <Out extends Animatable>(
    parents: OneOrMore<SpringValue>,
    config: InterpolatorConfig<Out>
  ): SpringValue<Animatable<Out>>

  // Range shortcuts
  <Out extends Animatable>(
    parents: OneOrMore<SpringValue>,
    range: ReadonlyArray<number>,
    output: ReadonlyArray<Out>,
    extrapolate?: ExtrapolateType
  ): SpringValue<Animatable<Out>>
}
