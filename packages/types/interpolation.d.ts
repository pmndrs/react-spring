import { Arrify, Constrain } from './util'
import { Animatable } from './animated'

export type EasingFunction = (t: number) => number

export type ExtrapolateType = 'identity' | 'clamp' | 'extend'

export interface InterpolatorFactory {
  <Input, Output>(
    interpolator: InterpolatorFn<Input, Output>
  ): typeof interpolator

  <Output>(config: InterpolatorConfig<Output>): (
    input: number
  ) => Animatable<Output>

  <Output>(
    range: readonly number[],
    output: readonly Constrain<Output, Animatable>[],
    extrapolate?: ExtrapolateType
  ): (input: number) => Animatable<Output>

  <Input, Output>(...args: InterpolatorArgs<Input, Output>): InterpolatorFn<
    Input,
    Output
  >
}

export type InterpolatorArgs<Input = any, Output = any> =
  | [InterpolatorFn<Arrify<Input>, Output>]
  | [InterpolatorConfig<Output>]
  | [
      readonly number[],
      readonly Constrain<Output, Animatable>[],
      (ExtrapolateType | undefined)?
    ]

export type InterpolatorFn<Input, Output> = (...inputs: Arrify<Input>) => Output

export type InterpolatorConfig<Output = Animatable> = {
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
  output: readonly Constrain<Output, Animatable>[]

  /**
   * Transformation to apply to the value before interpolation.
   */
  map?: (value: number) => number

  /**
   * Custom easing to apply in interpolator.
   */
  easing?: EasingFunction
}
