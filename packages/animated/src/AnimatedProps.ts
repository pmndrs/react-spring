import { FluidObserver, FluidEvent } from 'shared'
import * as G from 'shared/globals'

import { Animated, TreeContext } from './Animated'
import { AnimatedObject } from './AnimatedObject'

type Props = object & { style?: any }

export class AnimatedProps extends AnimatedObject implements FluidObserver {
  /** Equals true when an update is scheduled for "end of frame" */
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
  onParentChange({ type }: FluidEvent) {
    if (!this.dirty && type === 'change') {
      this.dirty = true
      G.frameLoop.onFrame(() => {
        this.dirty = false
        this.update()
      })
    }
  }
}
