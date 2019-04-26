import { Animated } from './animated/Animated'
import { AnimatedInterpolation } from './animated/AnimatedInterpolation'
import { SpringValue } from './types/animated'
import { InterpolationConfig } from './types/interpolation'

type GetValueType<T> = T extends number
  ? number
  : T extends string
  ? string
  : string | number

type GetArrayValueType<T extends any[]> = T extends (infer U)[]
  ? GetValueType<U>
  : string | number

interface SpringValueFromInterpolation {
  // Single AnimatedValue parent
  <In extends number | string, Out extends number | string>(
    parents: SpringValue<In>,
    interpolator: (input: GetValueType<In>) => Out
  ): SpringValue<Out>
  // Tuples of AnimatedValue parents, enables better types for common cases
  <
    In0 extends number | string,
    In1 extends number | string,
    Out extends number | string
  >(
    parents: [SpringValue<In0>, SpringValue<In1>],
    interpolator: (in0: GetValueType<In0>, in1: GetValueType<In1>) => Out
  ): SpringValue<Out>
  <
    In0 extends number | string,
    In1 extends number | string,
    In2 extends number | string,
    Out extends number | string
  >(
    parents: [SpringValue<In0>, SpringValue<In1>, SpringValue<In2>],
    interpolator: (
      in0: GetValueType<In0>,
      in1: GetValueType<In1>,
      in2: GetValueType<In2>
    ) => Out
  ): SpringValue<Out>
  // Array of same type AnimatedValue parents
  <In extends number | string, Out extends number | string>(
    parents: SpringValue<In>[],
    interpolator: (...input: GetValueType<In>[]) => Out
  ): SpringValue<Out>
  // Array of different type AnimatedValue parents
  <Out extends number | string>(
    parents: SpringValue<number | string>[],
    interpolator: (...input: (number | string)[]) => Out
  ): SpringValue<Out>
  // Single AnimatedValueArray
  <
    In extends (number | string)[],
    Out extends number | string | (number | string)[]
  >(
    parents: SpringValue<In>,
    interpolator: (...input: GetArrayValueType<In>[]) => Out
  ): SpringValue<Out>
  // Combinations of AnimatedValue + AnimatedValueArray etc
  <
    In extends number | string | (number | string)[],
    Out extends number | string | (number | string)[]
  >(
    parents: SpringValue | SpringValue[],
    interpolator: (...input: In[]) => Out
  ): SpringValue<Out>

  // Interpolation config
  <
    In extends number | string,
    Out extends number | string,
    Parent = SpringValue<In> | SpringValue<In[]>
  >(
    parents: Parent | Parent[],
    config: InterpolationConfig<Out>
  ): SpringValue<Out>

  // Range shortcuts
  <
    In extends number | string,
    Out extends number | string,
    Parent = SpringValue<In> | SpringValue<In[]>
  >(
    parents: Parent | Parent[],
    range: number[],
    output: Out[]
  ): SpringValue<Out>
}

export const interpolate: SpringValueFromInterpolation = (
  parents: SpringValue | SpringValue[],
  range: number[] | InterpolationConfig | ((...args: any) => any),
  output?: (number | string)[]
) =>
  parents &&
  new AnimatedInterpolation(
    (parents as any) as Animated[],
    range as number[],
    output!
  )
