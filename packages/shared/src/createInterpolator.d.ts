import {
  Animatable,
  InterpolatorFn,
  ExtrapolateType,
  InterpolatorConfig,
  Interpolatable,
} from './types'
interface InterpolatorFactory {
  <In extends Interpolatable, Out extends Animatable>(
    interpolator: InterpolatorFn<In, Out>
  ): typeof interpolator
  <In extends Interpolatable, Out extends Animatable>(
    config: InterpolatorConfig<Out>
  ): (input: number) => Animatable<Out>
  <Out extends Animatable>(
    range: ReadonlyArray<number>,
    output?: ReadonlyArray<Out>,
    extrapolate?: ExtrapolateType
  ): (input: number) => Animatable<Out>
}
export declare const createInterpolator: InterpolatorFactory
export {}
