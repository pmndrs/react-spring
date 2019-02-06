import * as Globals from './Globals'
import Animated from './Animated'
import { AnimatedObjectWithChildren } from './AnimatedWithChildren'

export default class AnimatedStyle extends AnimatedObjectWithChildren {
  constructor(style) {
    super()
    style = style || {}
    if (style.transform && !(style.transform instanceof Animated))
      style = Globals.applyAnimatedValues.transform(style)
    this.payload = style
  }
}
