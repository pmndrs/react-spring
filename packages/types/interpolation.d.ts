import { Arrify, Constrain } from './util'
import { Animatable } from './animated'

export type EasingFunction = (t: number) => number

export type ExtrapolateType = 'identity' | 'clamp' | 'extend'

export interface InterpolatorFactory {
  <In, Out>(interpolator: InterpolatorFn<In, Out>): typeof interpolator

  <Out>(config: InterpolatorConfig<Out>): (input: number) => Animatable<Out>

  <Out>(
    range: readonly number[],
    output: readonly Constrain<Out, Animatable>[],
    extrapolate?: ExtrapolateType
  ): (input: number) => Animatable<Out>

  <In, Out>(...args: InterpolatorArgs<In, Out>): InterpolatorFn<In, Out>
}

export type InterpolatorArgs<In = any, Out = any> =
  | [InterpolatorFn<Arrify<In>, Out>]
  | [InterpolatorConfig<Out>]
  | [
      readonly number[],
      readonly Constrain<Out, Animatable>[],
      (ExtrapolateType | undefined)?
    ]

export type InterpolatorFn<In, Out> = (...inputs: Arrify<In>) => Out

export type InterpolatorConfig<Out = Animatable> = {
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
  range?: readonly number[]

  /**
   * Output values from the interpolation function. Should match the length of the `range` array.
   */
  output: readonly Constrain<Out, Animatable>[]

  /**
   * Transformation to apply to the value before interpolation.
   */
  map?: (value: number) => number

  /**
   * Custom easing to apply in interpolator.
   */
  easing?: EasingFunction
}
