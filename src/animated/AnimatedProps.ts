import { AnimatedObject } from './Animated'
import { createAnimatedStyle as wrapStyle } from './Globals'

/**
 * Wraps the `style` property with `AnimatedStyle`.
 */
export class AnimatedProps<
  Props extends object & { style?: any } = {}
> extends AnimatedObject<Props> {
  update: () => void

  constructor(props: Props, callback: () => void) {
    super(
      props.style && wrapStyle
        ? { ...props, style: wrapStyle(props.style) }
        : props
    )
    this.update = callback
    this.attach()
  }
}
