import { AnimatedObject } from '@react-spring/animated'
import { AnimatedTransform } from './AnimatedTransform'

type Style = object & { transform?: any }

export class AnimatedStyle extends AnimatedObject {
  constructor(style: Style) {
    super(style)
  }

  setValue(style: Style) {
    super.setValue(
      style && style.transform
        ? { ...style, transform: new AnimatedTransform(style.transform) }
        : style
    )
  }
}
