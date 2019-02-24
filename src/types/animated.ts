import { InterpolationConfig } from './interpolation'

export type GetValueType<T> = T extends number
  ? number
  : T extends string
  ? string
  : string | number

export type GetArrayValueType<T extends any[]> = T extends (infer U)[]
  ? GetValueType<U>
  : string | number

/**
 * An animated value that can be assigned to `animated` component's properties.
 */
export interface SpringValue<
  // The literal value from initialization.
  Value extends number | string | (number | string)[] =
    | number
    | string
    | (number | string)[],
  // Widen the literal `Value` type to either string or number because the
  // value will change during animation.
  ValueType extends number | string = Value extends (number | string)[]
    ? GetArrayValueType<Value>
    : GetValueType<Value>
> {
  /**
   * Get the animated value. Automatically invoked when an `AnimatedValue`
   * is assigned to a property of an `animated` element.
   */
  getValue(): Value extends any[] ? ValueType[] : ValueType

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
  interpolate<Out extends number | string | (number | string)[]>(
    // Narrows argument types for AnimatedArrayValues if possible
    interpolator: Value extends string[]
      ? (...input: string[]) => Out
      : Value extends number[]
      ? (...input: number[]) => Out
      : Value extends (number | string)[]
      ? (...input: (number | string)[]) => Out
      : (input: ValueType) => Out
  ): SpringValue<Out>
  interpolate<Out extends number | string>(
    config: InterpolationConfig<Out>
  ): SpringValue<Out>
  interpolate<Out extends number | string>(
    range: number[],
    output: Out[]
  ): SpringValue<Out>
}
