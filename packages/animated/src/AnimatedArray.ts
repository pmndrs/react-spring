import { needsInterpolation, each } from 'shared'
import { AnimatedObject } from './AnimatedObject'
import { AnimatedString } from './AnimatedString'
import { AnimatedValue } from './AnimatedValue'

type Source = (AnimatedValue | AnimatedString)[]

/** An array of animated nodes */
export class AnimatedArray extends AnimatedObject {
  protected source!: Source
  constructor(source: Source) {
    super(source)
  }

  static create(from: any[], to?: any[]) {
    return new AnimatedArray(makeAnimated(from, to))
  }

  getValue() {
    return this.source.map(node => node.getValue())
  }

  setValue(newValue: any[]) {
    // Reuse the payload when lengths are equal.
    if (newValue.length == this.payload!.length) {
      each(this.payload, (node, i) => node.setValue(newValue[i]))
    } else {
      // Remake the payload when length changes.
      this.source = makeAnimated(newValue)
      this.payload = this._makePayload(this.source)
    }
  }
}

const makeAnimated = (from: any[], to = from) =>
  from.map((from, i) =>
    (needsInterpolation(from) ? AnimatedString : AnimatedValue).create(
      from,
      to[i]
    )
  )
