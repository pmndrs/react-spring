import { AnimatedValue } from './AnimatedValue'
import { AnimatedArray } from './Animated'
import { Animatable, SpringValue } from '../types/animated'
import { InterpolatorArgs } from '../types/interpolation'
import { interpolate } from '../interpolate'
import { OneOrMore } from '../types/common'
import { is } from '../shared/helpers'

export class AnimatedValueArray<T extends AnimatedValue[] = AnimatedValue[]>
  extends AnimatedArray<T>
  implements SpringValue<{ [P in keyof T]: number }> {
  constructor(values: T) {
    super()
    this.payload = values
  }

  public getValue(): { [P in keyof T]: number } {
    return this.payload.map(v => v.getValue()) as any
  }

  public setValue(value: OneOrMore<number>, flush = true) {
    if (is.arr(value)) {
      if (value.length === this.payload.length) {
        value.forEach((v, i) => this.payload[i].setValue(v, flush))
      }
    } else {
      this.payload.forEach(p => p.setValue(value, flush))
    }
  }

  public interpolate<Out extends Animatable>(
    ...args: InterpolatorArgs<{ [P in keyof T]: number }, Out>
  ): SpringValue<Out> {
    return interpolate(this, ...(args as [any])) as any
  }
}
