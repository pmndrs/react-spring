import { AnimatedObject } from './Animated'
import * as Globals from './Globals'

/**
 * Wraps the `style` property with `AnimatedStyle`.
 */
export default class AnimatedProps<
  Props extends object & { style?: any } = {}
> extends AnimatedObject<Props> {
  update: () => void

  constructor(props: Props, callback: () => void) {
    super()
    this.payload = !props.style
      ? props
      : {
          ...props,
          style: Globals.createAnimatedStyle(props.style),
        }
    this.update = callback
    this.attach()
  }
}
