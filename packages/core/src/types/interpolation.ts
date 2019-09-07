import { Animatable } from 'shared/types'
import { Spring } from 'src/Spring'

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
    range: readonly number[],
    output: readonly Out[],
    extrapolate?: ExtrapolateType
  ): Spring<Animatable<Out>>

  <Out extends Animatable = Animatable>(
    config: InterpolatorConfig<Out> | InterpolatorFn<In, Out>
  ): Spring<Out>
}
