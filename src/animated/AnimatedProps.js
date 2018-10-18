import Animated from './Animated'
import AnimatedStyle from './AnimatedStyle'
import { AnimatedObjectWithChildren } from './AnimatedWithChildren'
import { getValues } from '../shared/helpers'

export default class AnimatedProps extends AnimatedObjectWithChildren {
  constructor(props, callback) {
    super()
    if (props.style) props = { ...props, style: new AnimatedStyle(props.style) }
    this.payload = props
    this.callback = callback
    this.attach()
  }
  update = () => this.callback()
}
