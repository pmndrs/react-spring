import { Indexable, each } from 'shared'
import { Animated, isAnimated } from './Animated'
import { AnimatedValue } from './AnimatedValue'

export class AnimatedObject extends Animated {
  protected payload!: Set<AnimatedValue>
  constructor(protected source: Indexable) {
    super()
    this.payload = toPayload(source)
  }

  getValue(animated?: boolean) {
    const obj: any = {}
    each(this.source, (val, key) => {
      if (isAnimated(val)) {
        obj[key] = val.getValue(animated)
      } else if (!animated) {
        obj[key] = val
      }
    })
    return obj
  }

  updatePayload(prev: Animated, next: Animated) {
    const source = { ...this.source }
    each(source, (val, key) => {
      if (val === prev) source[key] = next
    })
    this.source = source
    this.payload = toPayload(source)
  }

  _attach() {
    each(this.source, addChild, this)
  }

  _detach() {
    each(this.source, removeChild, this)
  }
}

/** Convert an array or object to a flat payload */
export function toPayload(source: Indexable) {
  const payload = new Set<AnimatedValue>()
  each(source, val => {
    if (isAnimated(val)) {
      each(val.getPayload(), node => payload.add(node))
    }
  })
  return payload
}

export function addChild(this: Animated, parent: any) {
  if (isAnimated(parent)) parent.addChild(this)
}

export function removeChild(this: Animated, parent: any) {
  if (isAnimated(parent)) parent.removeChild(this)
}
