import { isAnimatedString } from '@react-spring/shared'
import { AnimatedObject } from './AnimatedObject'
import { AnimatedString } from './AnimatedString'
import { AnimatedValue } from './AnimatedValue'

type Value = number | string
type Source = AnimatedValue<Value>[]

/** An array of animated nodes */
export class AnimatedArray<
  T extends ReadonlyArray<Value> = Value[]
> extends AnimatedObject {
  protected source!: Source
  constructor(source: T) {
    super(source)
  }

  /** @internal */
  static create<T extends ReadonlyArray<Value>>(source: T) {
    return new AnimatedArray(source)
  }

  getValue(): T {
    return this.source.map(node => node.getValue()) as any
  }

  setValue(source: T) {
    const payload = this.getPayload()
    // Reuse the payload when lengths are equal.
    if (source.length == payload.length) {
      return payload.some((node, i) => node.setValue(source[i]))
    }
    // Remake the payload when length changes.
    super.setValue(source.map(makeAnimated))
    return true
  }
}

function makeAnimated(value: any) {
  const nodeType = isAnimatedString(value) ? AnimatedString : AnimatedValue
  return nodeType.create(value)
}
