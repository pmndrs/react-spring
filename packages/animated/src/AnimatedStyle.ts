import { AnimatedObject } from './AnimatedObject'
import * as G from 'shared/globals'

type Style = object & { transform?: any }

export class AnimatedStyle extends AnimatedObject {
  constructor(style = {} as Style) {
    super(
      style.transform && G.createAnimatedTransform
        ? { ...style, transform: G.createAnimatedTransform(style.transform) }
        : style
    )
  }
}
