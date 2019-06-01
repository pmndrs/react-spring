import { Animated } from './Animated'
import { Animatable, SpringValue, InterpolatorArgs } from 'shared'
export declare class AnimatedValue<T = number> extends Animated
  implements SpringValue<T> {
  private animatedStyles
  value: T
  startPosition: number
  lastPosition: number
  lastVelocity?: number
  startTime?: number
  lastTime?: number
  done: boolean
  static from(value: any): Animated<unknown>
  constructor(value: T)
  getValue(): T
  setValue: (value: T, flush?: boolean) => void
  interpolate<Out extends Animatable>(
    ...args: InterpolatorArgs<T, Out>
  ): SpringValue<Out>
  reset(isActive: boolean): void
  clearStyles(): void
  private flush
}
