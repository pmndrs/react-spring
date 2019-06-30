import { SpringValue } from '../types/animated'
import { InterpolationConfig } from '../types/interpolation'
import Animated from './Animated'
import AnimatedInterpolation from './AnimatedInterpolation'
import AnimatedProps from './AnimatedProps'
import { ExtrapolateType } from './createInterpolator'

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

export default class AnimatedValue extends Animated implements SpringValue {
  private animatedStyles = new Set<AnimatedProps>()

  public value: number | string
  public startPosition: number | string
  public lastPosition: number | string
  public lastVelocity?: number
  public startTime?: number
  public lastTime?: number
  public done = false

  constructor(value: number | string) {
    super()
    this.value = value
    this.startPosition = value
    this.lastPosition = value
  }

  private flush() {
    if (this.animatedStyles.size === 0) {
      addAnimatedStyles(this, this.animatedStyles)
    }
    this.animatedStyles.forEach(animatedStyle => animatedStyle.update())
  }

  public clearStyles() {
    this.animatedStyles.clear()
  }

  public setValue = (value: number | string, flush = true) => {
    this.value = value
    if (flush) this.flush()
  }

  public getValue() {
    return this.value
  }

  public interpolate(
    range: number[] | InterpolationConfig | ((...args: any[]) => any),
    output?: (number | string)[],
    extrapolate?: ExtrapolateType
  ): AnimatedInterpolation {
    return new AnimatedInterpolation(
      this,
      range as number[],
      output!,
      extrapolate
    )
  }
}
