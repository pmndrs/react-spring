import { Animated } from './Animated'
import { AnimatedArray } from './AnimatedArray'
import { AnimatedValue } from './AnimatedValue'

export type AnimatedType<T = any> = Function & {
  create: (
    from: any,
    goal?: any
  ) => Animated &
    (T extends ReadonlyArray<number | string>
      ? AnimatedArray<T>
      : AnimatedValue<T>)
}
