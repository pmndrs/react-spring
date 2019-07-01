import { AnimatedValue } from './AnimatedValue'
export const animatedTag = Symbol.for('isAnimated')

export const isAnimated = (val: any): val is Animated =>
  !!(val && val[animatedTag])

export abstract class Animated {
  protected [animatedTag] = true
  protected children = new Set<Animated>()
  protected payload?: Set<AnimatedValue>

  /** Returns all values contained by this node. Pass true for only the animated values. */
  abstract getValue(animated?: boolean): any

  /** Returns the set of `AnimatedValue` nodes contained by this node. */
  getPayload(): ReadonlySet<AnimatedValue> {
    return this.payload!
  }

  /** Replace an `AnimatedValue` node in the payload. */
  abstract updatePayload(prev: Animated, next: Animated): void

  /** Returns the set of animated nodes that depend on this node. */
  getChildren(): ReadonlySet<Animated> {
    return this.children
  }

  addChild(child: Animated) {
    this.children.size || this._attach()
    this.children.add(child)
  }

  removeChild(child: Animated) {
    this.children.delete(child)
    this.children.size || this._detach()
  }

  /** Called when this node goes from 0 children to 1+ children. */
  abstract _attach(): void

  /** Called when this node goes from 1+ children to 0 children. */
  abstract _detach(): void
}
