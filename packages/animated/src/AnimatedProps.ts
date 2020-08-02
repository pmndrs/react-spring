import { FluidObserver, FluidEvent } from '@react-spring/shared'
import * as G from '@react-spring/shared/src/globals'

import { AnimatedObject } from './AnimatedObject'
import { TreeContext } from './context'

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
      TreeContext.current = context
      if (props.style) {
        const { createAnimatedStyle } = context.host
        props = { ...props, style: createAnimatedStyle(props.style) }
      }
    }
    super.setValue(props)
    TreeContext.current = null
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
