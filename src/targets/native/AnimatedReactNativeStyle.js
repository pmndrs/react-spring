import AnimatedWithChildren from '../../animated/AnimatedWithChildren'
import AnimatedStyle from '../../animated/AnimatedStyle'

export default class AnimatedReactNativeStyle extends AnimatedWithChildren {
  constructor(styles = []) {
    super()
    this.payload = styles.map(style => {
      if (Array.isArray(style))
        return new AnimatedReactNativeStyle(style)

      return new AnimatedStyle(style)
    })
  }

  getValue() {
    return this.payload.map(style => style.getValue())
  }

  getAnimatedValue() {
    return this.payload.map(style => style.getAnimatedValue())
  }

  attach() {
    this.payload.forEach(style => style.addChild(this))
  }

  detach() {
    this.payload.forEach(style => style.removeChild(this))
  }
}
