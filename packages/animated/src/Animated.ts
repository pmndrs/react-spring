import { FluidValue, defineHidden } from 'shared'
import { AnimatedValue } from './AnimatedValue'

export const AnimatedType = '__$AnimatedType'

/** Returns true for `Animated` nodes. Returns false for `SpringValue` objects. */
export const isAnimated = (value: any): value is Animated =>
  !!(value && value[AnimatedType])

export abstract class Animated<T = any> {
  constructor() {
    defineHidden(this, AnimatedType, 1)
  }

  /** The cache of animated numbers */
  protected payload?: Payload

  /** Returns every value of the node. Pass true for only the animated values. */
  abstract getValue(animated?: boolean): T

  /** Returns every animated number used by this node. */
  getPayload(): Payload {
    return this.payload || []
  }

  /** The `AnimatedProps` class sets this before initializing */
  static context: TreeContext | null = null
}

export type Payload = readonly AnimatedValue[]

export type TreeContext = {
  dependencies: Set<FluidValue>
}
