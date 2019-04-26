import { Animated, AnimatedObject } from './Animated'
import { createAnimatedTransform as wrapTransform } from './Globals'

export class AnimatedStyle<
  Payload extends object & { transform?: Animated } = {}
> extends AnimatedObject<Payload> {
  constructor(style: Payload = {} as Payload) {
    super()
    this.payload =
      style.transform && wrapTransform
        ? { ...style, transform: wrapTransform(style.transform) }
        : style
  }
}
