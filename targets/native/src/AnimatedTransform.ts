import { each } from 'shared'
import {
  Animated,
  isAnimated,
  addChild,
  removeChild,
  AnimatedValue,
} from '@react-spring/animated'

type Transform = { [key: string]: string | number | Animated }

export class AnimatedTransform extends Animated {
  constructor(protected source: Transform[]) {
    super()
    this.payload = toPayload(source)
  }

  getValue() {
    return this.source.map(transform => {
      const obj: any = {}
      each(transform, (val, key) => {
        obj[key] = isAnimated(val) ? val.getValue() : val
      })
      return obj
    })
  }

  updatePayload(prev: Animated, next: Animated) {
    const source = [...this.source]
    each(source, (transform, i) => {
      const key = Object.keys(transform)[0]
      if (transform[key] === prev) {
        source[i] = { [key]: next }
      }
    })
    this.source = source
    this.payload = toPayload(source)
  }

  _attach() {
    each(this.source, transform => each(transform, addChild, this))
  }

  _detach() {
    each(this.source, transform => each(transform, removeChild, this))
  }
}

function toPayload(source: Transform[]) {
  const payload = new Set<AnimatedValue>()
  each(source, transform =>
    each(transform, val => {
      if (isAnimated(val)) {
        each(val.getPayload(), node => payload.add(node))
      }
    })
  )
  return payload
}
