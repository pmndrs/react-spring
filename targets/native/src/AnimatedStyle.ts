import { AnimatedObject } from 'animated'
import { AnimatedTransform } from './AnimatedTransform'

type Style = object & { transform?: any }

export class AnimatedStyle extends AnimatedObject {
  constructor(style?: Style) {
    super(style || null)
  }

  setValue(style: Style | null) {
    super.setValue(
      style && style.transform
        ? { ...style, transform: new AnimatedTransform(style.transform) }
        : style
    )
  }
}
