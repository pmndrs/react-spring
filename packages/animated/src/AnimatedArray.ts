import { is, Animatable, SpringValue, InterpolatorArgs, each } from 'shared'
import { Animated } from './Animated'
import { AnimatedObject, toPayload } from './AnimatedObject'
import { interpolate } from './interpolate'
import invariant from 'tiny-invariant'

/** An array of animated nodes */
export class AnimatedArray extends AnimatedObject
  implements SpringValue<any[]> {
  protected source!: Animated[]
  constructor(source: Animated[]) {
    super(source)
  }

  getValue(animated?: boolean) {
    return this.source.map(node => node.getValue(animated))
  }

  setValue(value: any, flush?: boolean) {
    const nodes = this.payload
    if (is.arr(value)) {
      invariant(value.length == nodes.size)
      let i = 0
      each(nodes, node => node.setValue(value[i++], flush))
    } else {
      each(nodes, node => node.setValue(value, flush))
    }
  }

  interpolate<Out extends Animatable>(
    ...args: InterpolatorArgs<any[], Out>
  ): SpringValue<Out> {
    return (interpolate as any)(this, ...args)
  }

  updatePayload(prev: Animated, next: Animated) {
    const source = [...this.source]
    each(source, (val, index) => {
      if (val === prev) source[index] = next
    })
    this.source = source
    this.payload = toPayload(source)
  }
}
