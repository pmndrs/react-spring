import { AnimatedObjectWithChildren } from './Animated'
import * as Globals from './Globals'

export default class AnimatedProps extends AnimatedObjectWithChildren {
  update: () => void

  constructor(props: any, callback: () => void) {
    super()
    if (props.style)
      props = { ...props, style: Globals.createAnimatedStyle(props.style) }
    this.payload = props
    this.update = callback
    this.attach()
  }
}
