import { InterpolationConfig } from './interpolation'

type SpringifyProps<Props> = {
  [K in keyof Props]: Props[K] extends number | string | undefined
    ? SpringValue<Props[K]> | Props[K]
    : Props[K]
}

type SpringifyChildren<Props> = {
  [K in keyof Props]: K extends 'children'
    ? Props[K] | SpringValue<string | number>
    : Props[K]
}

type SpringifyStyle<Props> = {
  [K in keyof Props]: K extends 'style' ? SpringifyProps<Props[K]> : Props[K]
}

export type AnimatedComponentProps<
  C extends React.ReactType
> = JSX.LibraryManagedAttributes<
  C,
  SpringifyStyle<
    SpringifyChildren<SpringifyProps<React.ComponentPropsWithoutRef<C>>>
  >
> & {
  scrollLeft?: SpringValue<number>
  scrollTop?: SpringValue<number>
} & React.RefAttributes<C>

export type AnimatedComponent<
  C extends React.ReactType
> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AnimatedComponentProps<C>>
> &
  React.RefAttributes<C>

export interface CreateAnimatedComponent {
  <C extends React.ReactType>(Component: C): AnimatedComponent<C>
}

export type AnimatableValue = number | string | (number | string)[]

// The widest possible interpolator type, possible if interpolate() is passed
// a custom interpolation function.
export type Interpolator<
  In extends AnimatableValue = AnimatableValue,
  Out extends number | string = number | string
> = In extends any[]
  ? (...input: In) => Out extends number ? number : string
  : (input: In) => Out extends number ? number : string

/**
 * An animated value that can be assigned to `animated` component's properties.
 */
export interface SpringValue<T extends AnimatableValue = AnimatableValue> {
  /**
   * Get the animated value. Automatically invoked when an `AnimatedValue`
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
  interpolate<Out extends number | string>(
    config: InterpolationConfig<Out> | Interpolator<T>
  ): SpringValue<Out extends number ? number : string>

  interpolate<Out extends number | string>(
    range: number[],
    output: Out[]
  ): SpringValue<Out extends number ? number : string>
}
