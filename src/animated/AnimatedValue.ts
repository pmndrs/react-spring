import { Animated, isAnimated } from './Animated'
import { AnimatedProps } from './AnimatedProps'
import { Animatable, SpringValue } from '../types/animated'
import { InterpolatorArgs } from '../types/interpolation'
import { interpolate } from '../interpolate'
import { now } from './Globals'
import { is } from '../shared/helpers'

/**
 * Animated works by building a directed acyclic graph of dependencies
 * transparently when you render your Animated components.
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
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */

function addAnimatedStyles(
  node: Animated | AnimatedProps,
  styles: Set<AnimatedProps>
) {
  if ('update' in node) {
    styles.add(node)
  } else {
    node.getChildren().forEach(child => addAnimatedStyles(child, styles))
  }
}

export class AnimatedValue<T = number> extends Animated
  implements SpringValue<T> {
  private animatedStyles = new Set<AnimatedProps>()

  public value: T
  public startPosition!: number
  public lastPosition!: number
  public lastVelocity?: number
  public startTime?: number
  public lastTime?: number
  public done = false

  static from(value: any) {
    return isAnimated(value) ? value : new AnimatedValue(value)
  }

  constructor(value: T) {
    super()
    this.value = value
    if (is.num(value)) {
      this.startPosition = value
      this.lastPosition = value
    }
  }

  public getValue() {
    return this.value
  }

  public setValue = (value: T, flush = true) => {
    this.value = value
    if (flush) this.flush()
  }

  public interpolate<Out extends Animatable>(
    ...args: InterpolatorArgs<T, Out>
  ): SpringValue<Out> {
    return interpolate(this, ...(args as [any])) as any
  }

  public reset(isActive: boolean) {
    if (is.num(this.value)) {
      this.startPosition = this.value
      this.lastPosition = this.value
      this.lastVelocity = isActive ? this.lastVelocity : undefined
      this.lastTime = isActive ? this.lastTime : undefined
      this.startTime = now()
    }
    this.done = false
    this.animatedStyles.clear()
  }

  public clearStyles() {
    this.animatedStyles.clear()
  }

  private flush() {
    if (this.animatedStyles.size === 0) {
      addAnimatedStyles(this, this.animatedStyles)
    }
    this.animatedStyles.forEach(animatedStyle => animatedStyle.update())
  }
}
