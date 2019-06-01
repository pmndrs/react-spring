import { AnimatedObject } from './Animated'
/**
 * Wraps the `style` property with `AnimatedStyle`.
 */
export declare class AnimatedProps<
  Props extends object & {
    style?: any
  } = {}
> extends AnimatedObject<Props> {
  update: () => void
  constructor(props: Props, callback: () => void)
}
