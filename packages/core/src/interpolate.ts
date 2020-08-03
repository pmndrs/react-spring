import { FluidValue, deprecateInterpolate } from '@react-spring/shared'
import {
  Constrain,
  OneOrMore,
  Animatable,
  ExtrapolateType,
  InterpolatorConfig,
  InterpolatorFn,
} from '@react-spring/types'
import { Interpolation } from './Interpolation'

/** Map the value of one or more dependencies */
export const to: Interpolator = (source: any, ...args: [any]) =>
  new Interpolation(source, args)

/** @deprecated Use the `to` export instead */
export const interpolate: Interpolator = (source: any, ...args: [any]) => (
  deprecateInterpolate(), new Interpolation(source, args)
)

/** Extract the raw value types that are being interpolated */
export type Interpolated<T extends ReadonlyArray<any>> = {
  [P in keyof T]: T[P] extends { get(): infer U } ? U : never
}

/**
 * This interpolates one or more `FluidValue` objects.
 * The exported `interpolate` function uses this type.
 */
export interface Interpolator {
  // Single parent
  <In, Out>(
    parent: FluidValue<In>,
    interpolator: InterpolatorFn<In, Out>
  ): Interpolation<Out>

  // Tuple of parents
  <In extends ReadonlyArray<FluidValue>, Out>(
    parents: In,
    interpolator: (...args: Interpolated<In>) => Out
  ): Interpolation<Out>

  // Interpolation config
  <Out>(
    parents: OneOrMore<FluidValue>,
    config: InterpolatorConfig<Out>
  ): Interpolation<Animatable<Out>>

  // Range shortcuts
  <Out>(
    parents: OneOrMore<FluidValue<number>> | FluidValue<number[]>,
    range: readonly number[],
    output: readonly Constrain<Out, Animatable>[],
    extrapolate?: ExtrapolateType
  ): Interpolation<Animatable<Out>>
}
