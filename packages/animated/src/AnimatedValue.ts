import { Animatable, SpringValue, InterpolatorArgs, is, each } from 'shared'
import { AnimatedProps } from './AnimatedProps'
import { to } from './interpolate'
import { Animated } from './Animated'
import { deprecateInterpolate } from 'shared/deprecations'
import * as G from 'shared/globals'

/** An animated number or a native attribute value */
export class AnimatedValue<T = unknown> extends Animated
  implements SpringValue<T> {
  private views = new Set<AnimatedProps>()

  value: T
  startPosition!: number
  lastPosition!: number
  lastVelocity?: number
  startTime?: number
  lastTime?: number
  done = false

  constructor(value: T) {
    super()
    this.value = value
    this.payload = new Set([this])
    if (is.num(value)) {
      this.startPosition = value
      this.lastPosition = value
    }
  }

  getValue() {
    return this.value
  }

  setValue(value: T, flush?: boolean) {
    this.value = value
    if (flush !== false) {
      if (!this.views.size) {
        collectViews(this, this.views)
      }
      each(this.views, view => view.update())
    }
  }

  to<Out extends Animatable>(
    ...args: InterpolatorArgs<T, Out>
  ): SpringValue<Out> {
    return (to as any)(this, ...args)
  }

  interpolate<Out extends Animatable>(
    ...args: InterpolatorArgs<T, Out>
  ): SpringValue<Out> {
    deprecateInterpolate()
    return this.to(...args)
  }

  reset(isActive: boolean) {
    if (is.num(this.value)) {
      this.startPosition = this.value
      this.lastPosition = this.value
      this.lastVelocity = isActive ? this.lastVelocity : undefined
      this.lastTime = isActive ? this.lastTime : undefined
      this.startTime = G.now()
    }
    this.done = false
    this.views.clear()
  }

  // This is never called for AnimatedValue nodes.
  updatePayload: any

  // Do nothing for either of these.
  _attach() {}
  _detach() {}
}

/**
 * This library works by building a directed acyclic graph of dependencies
 * transparently whenever you render your Animated components.
 *
 *               new Animated.Value(0)
 *     .interpolate()        .interpolate()    new Animated.Value(1)
 *         opacity               translateY      scale
 *          style                         transform
 *         View#234                         style
 *                                         View#123
 *
 * A) Top Down phase
 * When an AnimatedValue is updated, we recursively go down through this
 * graph in order to find leaf nodes: the components that depend on our value.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new props that it needs. This two-phase process is
 * necessary because some props (eg: "transform") can have multiple parents.
 */
function collectViews(
  node: Animated | AnimatedProps,
  views: Set<AnimatedProps>
) {
  if ('update' in node) {
    views.add(node)
  } else {
    each(node.getChildren(), child => collectViews(child, views))
  }
}
