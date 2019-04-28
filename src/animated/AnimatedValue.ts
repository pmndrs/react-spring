import { Animated } from './Animated'
import { interpolate, InterpolateMethod } from './AnimatedInterpolation'
import { AnimatedProps } from './AnimatedProps'
import { now } from './Globals'

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

export class AnimatedValue extends Animated {
  private animatedStyles = new Set<AnimatedProps>()

  public value: number
  public startPosition: number
  public lastPosition: number
  public lastVelocity?: number
  public startTime?: number
  public lastTime?: number
  public done = false

  readonly interpolate = interpolate as InterpolateMethod<number>

  constructor(value: number) {
    super()
    this.value = value
    this.startPosition = value
    this.lastPosition = value
  }

  public getValue() {
    return this.value
  }

  public setValue = (value: number, flush = true) => {
    this.value = value
    if (flush) this.flush()
  }

  public reset(isActive: boolean) {
    this.startPosition = this.value
    this.lastPosition = this.value
    this.lastVelocity = isActive ? this.lastVelocity : undefined
    this.lastTime = isActive ? this.lastTime : undefined
    this.startTime = now()
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
