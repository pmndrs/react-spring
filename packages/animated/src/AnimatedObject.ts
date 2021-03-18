import { Lookup } from '@react-spring/types'
import {
  each,
  eachProp,
  getFluidValue,
  hasFluidValue,
} from '@react-spring/shared'
import { Animated, isAnimated, getPayload } from './Animated'
import { AnimatedValue } from './AnimatedValue'
import { TreeContext } from './context'

/** An object containing `Animated` nodes */
export class AnimatedObject extends Animated {
  constructor(protected source: Lookup) {
    super()
    this.setValue(source)
  }

  getValue(animated?: boolean) {
    const values: Lookup = {}
    eachProp(this.source, (source, key) => {
      if (isAnimated(source)) {
        values[key] = source.getValue(animated)
      } else if (hasFluidValue(source)) {
        values[key] = getFluidValue(source)
      } else if (!animated) {
        values[key] = source
      }
    })
    return values
  }

  /** Replace the raw object data */
  setValue(source: Lookup) {
    this.source = source
    this.payload = this._makePayload(source)
  }

  reset() {
    if (this.payload) {
      each(this.payload, node => node.reset())
    }
  }

  /** Create a payload set. */
  protected _makePayload(source: Lookup) {
    if (source) {
      const payload = new Set<AnimatedValue>()
      eachProp(source, this._addToPayload, payload)
      return Array.from(payload)
    }
  }

  /** Add to a payload set. */
  protected _addToPayload(this: Set<AnimatedValue>, source: any) {
    if (TreeContext.dependencies && hasFluidValue(source)) {
      TreeContext.dependencies.add(source)
    }
    const payload = getPayload(source)
    if (payload) {
      each(payload, node => this.add(node))
    }
  }
}
