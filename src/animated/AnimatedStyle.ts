import Animated, { AnimatedObject } from './Animated'
import * as Globals from './Globals'

export default class AnimatedStyle<
  Payload extends object & { transform?: Animated } = {}
> extends AnimatedObject<Payload> {
  constructor(style: Payload = {} as Payload) {
    super()
    if (style.transform && !(style.transform instanceof Animated)) {
      style = Globals.applyAnimatedValues.transform(style)
    }
    this.payload = style
  }
}
