import { AnimatedInterpolation } from './animated/AnimatedInterpolation'
import { SpringValue, Animatable } from './types/animated'
import { InterpolatorConfig, ExtrapolateType } from './types/interpolation'
import { OneOrMore, Arrify } from './types/common'

export const interpolate: SpringInterpolator = (parents: any, ...args: any) =>
  new AnimatedInterpolation(parents, ...args) as any

type RawValues<T extends ReadonlyArray<any>> = {
  [P in keyof T]: T[P] extends SpringValue<infer U> ? U : never
}

/** This interpolates one or more `SpringValue` objects */
interface SpringInterpolator {
  // Single AnimatedValue parent
  <In extends Animatable, Out extends Animatable>(
    parent: SpringValue<In>,
    interpolator: (...args: Arrify<In>) => Out
  ): SpringValue<Animatable<Out>>

  // Tuples of AnimatedValue parents
  <In extends ReadonlyArray<SpringValue>, Out extends Animatable>(
    parents: In,
    interpolator: (...args: RawValues<In>) => Out
  ): SpringValue<Animatable<Out>>

  // Interpolation config
  <Out extends Animatable>(
    parents: OneOrMore<SpringValue>,
    config: InterpolatorConfig<Out>
  ): SpringValue<Animatable<Out>>

  // Range shortcuts
  <Out extends Animatable>(
    parents: OneOrMore<SpringValue>,
    range: number[],
    output: Out[],
    extrapolate?: ExtrapolateType
  ): SpringValue<Animatable<Out>>
}
