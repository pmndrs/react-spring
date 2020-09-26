import { raf, FluidObserver, FluidEvent } from '@react-spring/shared'

import { AnimatedObject } from './AnimatedObject'
import { TreeContext } from './context'

type Props = object & { style?: any }

export class AnimatedProps extends AnimatedObject implements FluidObserver {
  constructor(public update: () => void) {
    super(null)
  }

  setValue(props: Props | null, context?: TreeContext) {
    if (props) {
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
  }

  /** @internal */
  onParentChange({ type }: FluidEvent) {
    if (type === 'change') {
      raf.write(this.update)
    }
  }
}
