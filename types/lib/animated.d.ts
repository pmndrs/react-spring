import { Arrify, OneOrMore, Remap, PickAnimated } from './common'
import { Interpolator } from './interpolation'

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
   * Get the animated value. Automatically invoked when a `SpringValue`
   * is assigned to a property of an `animated` element.
   */
  getValue(): T
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
  interpolate: Interpolator<Arrify<T>>
}

/**
 * The map of `Animated` objects passed into `animated()` components.
 *
 * Parameter `T` represents the options object passed into `useSpring`.
 */
export type SpringValues<T extends object> = Remap<
  { [key: string]: SpringValue<any> } & ({} extends Required<PickAnimated<T>>
    ? unknown
    : { [P in keyof PickAnimated<T>]: SpringValue<PickAnimated<T>[P]> })
>

// Extract the raw value types that are being animated
export type RawValues<T extends ReadonlyArray<any>> = {
  [P in keyof T]: T[P] extends SpringValue<infer U> ? U : never
}
