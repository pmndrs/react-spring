import { InterpolationConfig } from './interpolation'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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

type SpringifyStyle<Props> = Props extends { style?: infer S }
  ? S extends object
    ? Omit<Props, 'style'> & { style?: SpringifyProps<S> }
    : Props
  : Props

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
  Value extends undefined | number | string | (number | string)[] =
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
