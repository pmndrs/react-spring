import { interpolate, InterpolateMethod } from './AnimatedInterpolation'
import { AnimatedValue } from './AnimatedValue'
import { AnimatedArray } from './Animated'
import { OneOrMore } from '../types/common'
import { is } from '../shared/helpers'

export class AnimatedValueArray<
  T extends AnimatedValue[] = AnimatedValue[]
> extends AnimatedArray<T> {
  readonly interpolate = interpolate as InterpolateMethod<ReadonlyArray<number>>

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
}
