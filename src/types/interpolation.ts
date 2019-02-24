export type EasingFunction = (t: number) => number

export type ExtrapolateType = 'identity' | 'clamp' | 'extend'

/**
 * The config options for an interpolation.
 */
export type InterpolationConfig<Out = number | string> = {
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
  range?: number[]

  /**
   * Output values from the interpolation function. Should match the length of the `range` array.
   */
  output: Out[]

  /**
   * Transform the
   */
  map?: (value: number) => number

  easing?: EasingFunction
}

export type Interpolator<
  In extends number | string = number,
  Out extends number | string = number | string
> = (input: In) => Out

export type InterpolatorFromConfig<
  Out extends number | string = number | string
> = (config: InterpolationConfig<Out>) => Interpolator<number, Out>

export interface CreateInterpolator<
  In extends number = number,
  Out extends number | string = number | string
> {
  <
    T extends number | string = Out,
    Fn extends Interpolator<In, Out> = Interpolator<In, Out>
  >(
    interpolator: Fn
  ): Fn
  <T extends number | string = Out>(
    config: InterpolationConfig<Out>
  ): Interpolator<In, Out>
  <T extends number | string = Out>(range: number[], output: T[]): Interpolator<
    In,
    T
  >
}

// Creates an interpolator of animated values
export interface AnimatedValueFromInterpolation {
  <Out extends number | string>(
    parents: any | any[],
    interpolator: Interpolator<Out>
  ): any
  <Out extends number | string>(
    parents: any | any[],
    config: InterpolationConfig<Out>
  ): any
  <Out extends number | string>(
    parents: any | any[],
    range: number[],
    output: Out[]
  ): any
}
