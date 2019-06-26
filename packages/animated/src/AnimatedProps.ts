import { AnimatedObject } from './AnimatedObject'
import * as G from 'shared/globals'

type Props = object & { style?: any }

export class AnimatedProps extends AnimatedObject {
  constructor(props: Props, public update: () => void) {
    super(
      props.style && G.createAnimatedStyle
        ? { ...props, style: G.createAnimatedStyle(props.style) }
        : props
    )
  }
}
