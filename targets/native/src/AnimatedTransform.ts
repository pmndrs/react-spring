import { each, getFluidValue } from 'shared'
import { Animated, AnimatedValue, AnimatedObject } from 'animated'

type Transform = { [key: string]: string | number | Animated }

type Source = Transform[] | null

export class AnimatedTransform extends AnimatedObject {
  protected source!: Source
  constructor(source: Source) {
    super(source)
  }

  getValue() {
    return this.source
      ? this.source.map(source => {
          const transform: any = {}
          each(source, (source, key) => {
            transform[key] = getFluidValue(source)
          })
          return transform
        })
      : []
  }

  setValue(source: Source) {
    this.source = source
    this.payload = this._makePayload(source)
  }

  protected _makePayload(source: Source) {
    if (!source) return []
    const payload = new Set<AnimatedValue>()
    each(source, transform => each(transform, this._addToPayload, payload))
    return Array.from(payload)
  }
}
