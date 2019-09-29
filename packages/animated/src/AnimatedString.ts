import { AnimatedValue } from './AnimatedValue'
import { is, createInterpolator } from '@react-spring/shared'

type Value = string | number

export class AnimatedString extends AnimatedValue<Value> {
  protected _value!: number
  protected _string: string | null = null
  protected _toString: (input: number) => string

  constructor(from: string, to: string) {
    super(0)
    this._toString = createInterpolator({ output: [from, to] })
  }

  static create<T>(from: T, to: T | null = from): AnimatedValue<T> {
    if (is.str(from) && is.str(to)) {
      return new AnimatedString(from, to) as any
    }
    throw TypeError('Expected "from" and "to" to be strings')
  }

  getValue() {
    let value = this._string
    return value == null ? (this._string = this._toString(this._value)) : value
  }

  setValue(value: Value) {
    if (!is.num(value)) {
      this._string = value
      this._value = 1
    } else if (super.setValue(value)) {
      this._string = null
    } else {
      return false
    }
    return true
  }

  reset(isActive?: boolean, goal?: string) {
    if (goal) {
      this._toString = createInterpolator({
        output: [this.getValue(), goal],
      })
    }
    this._value = 0
    super.reset(isActive)
  }
}
