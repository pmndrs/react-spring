import {
  createInterpolator,
  Animatable,
  SpringValue,
  Interpolatable,
  InterpolatorArgs,
  Interpolator,
  is,
  OneOrMore,
  toArray,
  each,
} from 'shared'
import { deprecateInterpolate } from 'shared/deprecations'
import { Animated } from './Animated'
import { to } from './interpolate'
import { toPayload, addChild, removeChild } from './AnimatedObject'

export class AnimatedInterpolation<
  In extends Interpolatable = Interpolatable,
  Out extends Animatable = Animatable
> extends Animated implements SpringValue<Out> {
  calc: Interpolator<In>
  constructor(
    public source: OneOrMore<Animated>,
    args: InterpolatorArgs<In, Out>
  ) {
    super()
    this.calc = createInterpolator(...(args as [any])) as any
  }

  getValue(animated?: boolean): Out {
    const args = is.arr(this.source)
      ? this.source.map(node => node.getValue(animated))
      : toArray(this.source.getValue(animated))
    return (this.calc as any)(...args)
  }

  to<T extends Animatable>(...args: InterpolatorArgs<Out, T>): SpringValue<T> {
    return (to as any)(this, ...args)
  }

  interpolate<T extends Animatable>(
    ...args: InterpolatorArgs<Out, T>
  ): SpringValue<T> {
    deprecateInterpolate()
    return this.to(...args)
  }

  getPayload() {
    return is.arr(this.source)
      ? this.payload || (this.payload = toPayload(this.source))
      : this.source.getPayload()
  }

  updatePayload(prev: Animated, next: Animated) {
    this.payload = void 0
    if (is.arr(this.source)) {
      const source = [...this.source]
      each(source, (val, index) => {
        if (val === prev) source[index] = next
      })
      this.source = source
    } else {
      this.source = next
    }
  }

  _attach() {
    each(toArray(this.source), addChild, this)
  }

  _detach() {
    each(toArray(this.source), removeChild, this)
  }
}
