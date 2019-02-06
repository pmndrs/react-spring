import * as Globals from './Globals'
import { AnimatedObjectWithChildren } from './AnimatedWithChildren'

export default class AnimatedProps extends AnimatedObjectWithChildren {
  constructor(props, callback) {
    super()
    if (props.style)
      props = { ...props, style: Globals.createAnimatedStyle(props.style) }
    this.payload = props
    this.update = callback
    this.attach()
  }
}
