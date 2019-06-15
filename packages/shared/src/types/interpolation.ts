import { Animatable, SpringValue } from './animated'
import { Arrify } from './common'

export type EasingFunction = (t: number) => number

export type ExtrapolateType = 'identity' | 'clamp' | 'extend'

/** These types can be interpolated */
export type Interpolatable = ReadonlyArray<number | string>

/**
 * Interpolate the value with a custom interpolation function,
 * a configuration object or keyframe-like ranges.
 *
 * @example
 *
 * interpolate(alpha => `rgba(255, 165, 0, ${alpha})`)
 * interpolate({ range: [0, 1], output: ['yellow', 'red'], extrapolate: 'clamp' })
 * interpolate([0, 0.25, 1], ['yellow', 'orange', 'red'])
 */
export interface Interpolator<In extends ReadonlyArray<any> = any[]> {
  <Out extends Animatable = Animatable>(
    range: ReadonlyArray<number>,
    output: ReadonlyArray<Out>,
    extrapolate?: ExtrapolateType
  ): SpringValue<Animatable<Out>>

  <Out extends Animatable = Animatable>(
    config: InterpolatorConfig<Out> | InterpolatorFn<In, Out>
  ): SpringValue<Out>
}

// Parameters<Interpolation> is insufficient 😢
export type InterpolatorArgs<In = any, Out extends Animatable = Animatable> =
  | [InterpolatorConfig<Out> | InterpolatorFn<Arrify<In>, Out>]
  | [ReadonlyArray<number>, ReadonlyArray<Out>, (ExtrapolateType | undefined)?]

/**
 * An "interpolator" transforms an animated value. Animated arrays are spread
 * into the interpolator.
 */
export type InterpolatorFn<In extends ReadonlyArray<any> = any[], Out = any> = (
  ...input: In
) => Out

export type InterpolatorConfig<Out extends Animatable = Animatable> = {
  /**
   * What happens when the spring goes below its target value.
   *
   *  - `extend` continues the interpolation past the target value
   *  - `clamp` limits the interpolation at the max value
   *  - `identity` sets the value to the interpolation input as soon as it hits the boundary
   *
   * @default 'extend'
   */
  extrapolateLeft?: ExtrapolateType

  /**
   * What happens when the spring exceeds its target value.
   *
   *  - `extend` continues the interpolation past the target value
   *  - `clamp` limits the interpolation at the max value
   *  - `identity` sets the value to the interpolation input as soon as it hits the boundary
   *
   * @default 'extend'
   */
  extrapolateRight?: ExtrapolateType

  /**
   * What happens when the spring exceeds its target value.
   * Shortcut to set `extrapolateLeft` and `extrapolateRight`.
   *
   *  - `extend` continues the interpolation past the target value
   *  - `clamp` limits the interpolation at the max value
   *  - `identity` sets the value to the interpolation input as soon as it hits the boundary
   *
   * @default 'extend'
   */
  extrapolate?: ExtrapolateType

  /**
   * Input ranges mapping the interpolation to the output values.
   *
   * @example
   *
   *   range: [0, 0.5, 1], output: ['yellow', 'orange', 'red']
   *
   * @default [0,1]
   */
  range?: ReadonlyArray<number>

  /**
   * Output values from the interpolation function. Should match the length of the `range` array.
   */
  output: ReadonlyArray<Out>

  /**
   * Transformation to apply to the value before interpolation.
   */
  map?: (value: number) => number

  /**
   * Custom easing to apply in interpolator.
   */
  easing?: EasingFunction
}
