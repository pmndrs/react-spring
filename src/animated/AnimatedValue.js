import AnimatedWithChildren from './AnimatedWithChildren'
import AnimatedInterpolation from './AnimatedInterpolation'

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

function findAnimatedStyles(node, styles) {
  if (typeof node.update === 'function') styles.add(node)
  else node.getChildren().forEach(child => findAnimatedStyles(child, styles))
}

/**
 * Standard value for driving animations.  One `Animated.Value` can drive
 * multiple properties in a synchronized fashion, but can only be driven by one
 * mechanism at a time.  Using a new mechanism (e.g. starting a new animation,
 * or calling `setValue`) will stop any previous ones.
 */
export default class AnimatedValue extends AnimatedWithChildren {
  constructor(value) {
    super()
    this.value = value
    this.animatedStyles = new Set()
    this.done = false
    this.startPosition = value
    this.lastPosition = value
    this.lastVelocity = undefined
    this.lastTime = undefined
    this.controller = undefined
  }

  flush() {
    if (this.animatedStyles.size === 0) this.updateStyles()
    this.animatedStyles.forEach(animatedStyle => animatedStyle.update())
  }

  prepare(controller) {
    // Values stay loyal to their original controller, this is also a way to
    // detect trailing values originating from a foreign controller
    if (this.controller === undefined) this.controller = controller
    if (this.controller === controller) {
      this.startPosition = this.value
      this.lastPosition = this.value
      this.lastVelocity = controller.isActive ? this.lastVelocity : undefined
      this.lastTime = controller.isActive ? this.lastTime : undefined
      this.done = false
      this.animatedStyles.clear()
    }
  }

  setValue = value => (this.value = value)
  getValue = () => this.value
  updateStyles = () => findAnimatedStyles(this, this.animatedStyles)
  updateValue = value => this.flush((this.value = value))
  interpolate = (config, arg) => new AnimatedInterpolation(this, config, arg)
}
