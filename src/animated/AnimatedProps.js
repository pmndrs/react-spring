import Animated from './Animated'
import AnimatedStyle from './AnimatedStyle'
import { AnimatedObjectWithChildren } from './AnimatedWithChildren'
import { getValues } from '../shared/helpers'
import * as Globals from './Globals'

export default class AnimatedProps extends AnimatedObjectWithChildren {
  constructor(props, callback) {
    super()
    if (props.style) props = { ...props, style: Globals.createAnimatedStyle(props.style) }
    this.payload = props
    this.update = callback
    this.attach()
  }
}
