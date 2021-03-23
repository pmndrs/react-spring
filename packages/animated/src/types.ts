import { AnimatedArray } from './AnimatedArray'
import { AnimatedValue } from './AnimatedValue'

export type AnimatedType<T = any> = Function & {
  create: (
    from: any,
    goal?: any
  ) => T extends ReadonlyArray<number | string>
    ? AnimatedArray<T>
    : AnimatedValue<T>
}
