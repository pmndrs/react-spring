import { AnimatedObject } from './AnimatedObject'
import * as G from 'shared/globals'

type Style = object & { transform?: any }

export class AnimatedStyle extends AnimatedObject {
  constructor(style?: Style) {
    super(style || null)
  }

  setValue(style: Style | null) {
    super.setValue(
      style && style.transform && G.createAnimatedTransform
        ? { ...style, transform: G.createAnimatedTransform(style.transform) }
        : style
    )
  }
}
