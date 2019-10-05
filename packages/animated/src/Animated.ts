import { FluidValue, defineHidden } from 'shared'
import { AnimatedValue } from './AnimatedValue'

const $node: any = Symbol.for('Animated:node')

export const isAnimated = (value: any): value is Animated =>
  value instanceof Animated

/** Get the owner's `Animated` node. */
export const getAnimated = (owner: any): Animated | undefined =>
  owner && owner[$node]

/** Set the owner's `Animated` node. */
export const setAnimated = (owner: any, node: Animated) =>
  defineHidden(owner, $node, node)

/** Get every `AnimatedValue` in the owner's `Animated` node. */
export const getPayload = (owner: any): AnimatedValue[] | undefined =>
  owner && owner[$node] && owner[$node].getPayload()

export abstract class Animated<T = any> {
  /** The cache of animated numbers */
  protected payload?: Payload

  /** Returns every value of the node. Pass true for only the animated values. */
  abstract getValue(animated?: boolean): T

  abstract setValue(value: T): void

  abstract reset(): void

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
