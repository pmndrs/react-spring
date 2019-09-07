import { Animated } from './Animated'
import { AnimatedProps } from './AnimatedProps'

const tag = Symbol.for('animated:dependency')

export const isDependency = (value: any): value is Dependency =>
  !!(value && value[tag])

let nextId = 1

/** @internal */
export abstract class Dependency<T = any> {
  readonly [tag] = true
  readonly id = nextId++
  abstract node: Animated
  abstract get(): T
  abstract addChild(child: AnimatedProps | object): void
  abstract removeChild(child: AnimatedProps | object): void
}
