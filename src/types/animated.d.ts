import { Animated, AnimatedArray } from '../animated/Animated'
import { Interpolator } from './interpolation'
import { Arrify } from './common'

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
export interface SpringValue<T extends Animatable = Animatable> {
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
  interpolate: Interpolator<Arrify<T>>
}

//
// Animated components
//

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

type SpringifyProps<Props> = {
  [K in keyof Props]: Props[K] extends infer P
    ? P extends number | string
      ? SpringValue<P> | P
      : P
    : never
}

type SpringifyChildren<Props> = {
  [K in keyof Props]: K extends 'children'
    ? Props[K] | SpringValue<string | number>
    : Props[K]
}

type SpringifyStyle<Props> = {
  [K in keyof Props]: K extends 'style' ? SpringifyProps<Props[K]> : Props[K]
}
