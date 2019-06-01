import { Animatable, SpringValue, OneOrMore, InterpolatorArgs } from 'shared'
import { AnimatedValue } from './AnimatedValue'
import { AnimatedArray } from './Animated'
export declare class AnimatedValueArray<
  T extends AnimatedValue[] = AnimatedValue[]
> extends AnimatedArray<T> implements SpringValue<{ [P in keyof T]: number }> {
  constructor(values: T)
  getValue(): { [P in keyof T]: number }
  setValue(value: OneOrMore<number>, flush?: boolean): void
  interpolate<Out extends Animatable>(
    ...args: InterpolatorArgs<{ [P in keyof T]: number }, Out>
  ): SpringValue<Out>
}
