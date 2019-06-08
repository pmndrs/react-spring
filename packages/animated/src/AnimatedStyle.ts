import { Animated, AnimatedObject } from './Animated'
import * as G from 'shared/globals'

export class AnimatedStyle<
  Payload extends object & { transform?: Animated } = {}
> extends AnimatedObject<Payload> {
  constructor(style = {} as Payload) {
    super(
      style.transform && G.createAnimatedTransform
        ? { ...style, transform: G.createAnimatedTransform(style.transform) }
        : style
    )
  }
}
