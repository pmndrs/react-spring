import { Indexable, each, getFluidConfig } from 'shared'
import { Animated, isAnimated } from './Animated'
import { AnimatedValue } from './AnimatedValue'

type Source = Indexable | null

/** An object containing `Animated` nodes */
export class AnimatedObject extends Animated {
  protected source!: Source
  constructor(source: Source = null) {
    super()
    this.setValue(source)
  }

  getValue(animated?: boolean): Source {
    if (!this.source) return null
    const values: Indexable = {}
    each(this.source, (source, key) => {
      if (isAnimated(source)) {
        values[key] = source.getValue(animated)
      } else {
        const config = getFluidConfig(source)
        if (config) {
          values[key] = config.get()
        } else if (!animated) {
          values[key] = source
        }
      }
    })
    return values
  }

  /** Replace the raw object data */
  setValue(source: Source) {
    this.source = source
    this.payload = this._makePayload(source)
  }

  reset() {
    if (this.payload) {
      each(this.payload, node => node.reset())
    }
  }

  /** Create a payload set. */
  protected _makePayload(source: Source) {
    if (source) {
      const payload = new Set<AnimatedValue>()
      each(source, this._addToPayload, payload)
      return Array.from(payload)
    }
  }

  /** Add to a payload set. */
  protected _addToPayload(this: Set<AnimatedValue>, source: any) {
    const config = getFluidConfig(source)
    if (config && Animated.context) {
      Animated.context.dependencies.add(source)
    }
    const node: Animated = isAnimated(source.node) && source.node
    if (node) {
      each(node.getPayload(), node => this.add(node))
    }
  }
}
