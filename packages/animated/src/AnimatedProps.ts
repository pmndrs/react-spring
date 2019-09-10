import { FluidObserver } from 'shared'
import { Animated, TreeContext } from './Animated'
import { AnimatedObject } from './AnimatedObject'
import * as G from 'shared/globals'

type Props = object & { style?: any }

export class AnimatedProps extends AnimatedObject implements FluidObserver {
  dirty = false

  constructor(public update: () => void) {
    super(null)
  }

  setValue(props: Props | null, context?: TreeContext) {
    if (!props) return // The constructor passes null.
    if (context) {
      Animated.context = context
    }
    super.setValue(
      props.style && G.createAnimatedStyle
        ? { ...props, style: G.createAnimatedStyle(props.style) }
        : props
    )
    Animated.context = null
  }

  /** @internal */
  onParentChange() {
    if (!this.dirty) {
      this.dirty = true
      G.frameLoop.onFrame(() => {
        this.dirty = false
        this.update()
      })
    }
  }

  /** @internal */
  onParentPriorityChange() {}
}
