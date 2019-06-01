import { Animated, AnimatedObject } from './Animated'
export declare class AnimatedStyle<
  Payload extends object & {
    transform?: Animated
  } = {}
> extends AnimatedObject<Payload> {
  constructor(style?: Payload)
}
