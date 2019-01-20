import AnimatedWithChildren from '../../animated/AnimatedWithChildren'
import AnimatedStyle from '../../animated/AnimatedStyle'
import { flattenDeep } from '../../shared/helpers'

export default class AnimatedStyles extends AnimatedWithChildren {
  constructor(styles) {
    super()
    this.payload = flattenDeep(styles).map(style =>
      typeof style === 'number' ? style : new AnimatedStyle(style)
    )
  }

  getValue() {
    return this.payload.map(style =>
      typeof style === 'number' ? style : style.getValue()
    )
  }

  getAnimatedValue() {
    return this.payload
      .filter(style => typeof style !== 'number')
      .map(style => style.getAnimatedValue())
  }

  attach() {
    this.payload
      .filter(style => typeof style !== 'number')
      .forEach(style => style.addChild(this))
  }

  detach() {
    this.payload
      .filter(style => typeof style !== 'number')
      .forEach(style => style.removeChild(this))
  }
}
