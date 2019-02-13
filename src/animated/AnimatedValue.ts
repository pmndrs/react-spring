import AnimatedInterpolation from './AnimatedInterpolation'
import AnimatedWithChildren from './AnimatedWithChildren'
import { InterpolationConfig } from './Interpolation'

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
 * When an Animated.Value is updated, we recursively go down through this
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */

function findAnimatedStyles(node: any, styles: Set<any>) {
  if (typeof node.update === 'function') styles.add(node)
  else
    node
      .getChildren()
      .forEach((child: any) => findAnimatedStyles(child, styles))
}

/**
 * Standard value for driving animations.  One `Animated.Value` can drive
 * multiple properties in a synchronized fashion, but can only be driven by one
 * mechanism at a time.  Using a new mechanism (e.g. starting a new animation,
 * or calling `setValue`) will stop any previous ones.
 */
export default class AnimatedValue extends AnimatedWithChildren {
  value: number
  startPosition: number
  lastPosition: number

  done = false
  animatedStyles = new Set()
  lastVelocity?: number
  startTime?: number
  lastTime?: number

  constructor(value: number) {
    super()
    this.value = value
    this.startPosition = value
    this.lastPosition = value
  }

  flush() {
    if (this.animatedStyles.size === 0) this.updateStyles()
    this.animatedStyles.forEach(animatedStyle => animatedStyle.update())
  }

  setValue = (value: number, flush = true) => {
    this.value = value
    if (flush) this.flush()
  }

  getValue = () => this.value

  updateStyles = () => findAnimatedStyles(this, this.animatedStyles)

  updateValue = (value: number) => {
    this.setValue(value, true)
  }

  interpolate = (config: InterpolationConfig, arg: any) =>
    new AnimatedInterpolation(this, config, arg)
}
