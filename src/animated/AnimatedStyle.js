import * as Globals from './Globals'
import Animated from './Animated'
import { AnimatedObjectWithChildren } from './AnimatedWithChildren'
import { getValues } from '../shared/helpers'

export default class AnimatedStyle extends AnimatedObjectWithChildren {
  constructor(style) {
    super()
    style = style || {}
    if (style.transform && !(style.transform instanceof Animated))
      style = Globals.applyAnimatedValues.transform(style)
    this.payload = style
  }
}
