import { AnimatedValue } from './AnimatedValue'
import { Dependency } from './Dependency'

const tag = Symbol.for('animated')

/** Returns true for `Animated` nodes. Returns false for `Spring` objects. */
export const isAnimated = (value: any): value is Animated =>
  !!(value && value[tag])

export abstract class Animated<T = any> {
  readonly [tag] = true

  /** The cache of animated numbers */
  protected payload?: Payload

  /** Returns every value of the node. Pass true for only the animated values. */
  abstract getValue(animated?: boolean): T

  /** Returns every animated number used by this node. */
  getPayload(): Payload {
    return this.payload!
  }

  /** The `AnimatedProps` class sets this before initializing */
  static context: TreeContext | null = null
}

export type Payload = readonly AnimatedValue<number>[]

export type TreeContext = {
  /** The value streams in the tree */
  dependencies: Set<Dependency>
}
