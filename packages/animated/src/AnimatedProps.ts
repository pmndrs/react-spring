import { Animated, TreeContext } from './Animated'
import { AnimatedObject } from './AnimatedObject'
import { Dependency } from './Dependency'
import * as G from 'shared/globals'

type Props = object & { style?: any }

export class AnimatedProps extends AnimatedObject {
  dependencies!: Dependency[]

  constructor(public update: () => void) {
    super(null)
  }

  setValue(props: Props, context?: TreeContext) {
    if (context) {
      Animated.context = context
    }
    super.setValue(
      props.style && G.createAnimatedStyle
        ? { ...props, style: G.createAnimatedStyle(props.style) }
        : props
    )
    Animated.context = null
  }
}
