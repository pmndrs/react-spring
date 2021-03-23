import { AnimatedValue } from './AnimatedValue'
import { is, createInterpolator } from '@react-spring/shared'

type Value = string | number

export class AnimatedString extends AnimatedValue<Value> {
  protected _value!: number
  protected _string: string | null = null
  protected _toString: (input: number) => string

  constructor(value: string) {
    super(0)
    this._toString = createInterpolator({
      output: [value, value],
    })
  }

  /** @internal */
  static create(value: string) {
    return new AnimatedString(value)
  }

  getValue() {
    let value = this._string
    return value == null ? (this._string = this._toString(this._value)) : value
  }

  setValue(value: Value) {
    if (is.str(value)) {
      if (value == this._string) {
        return false
      }
      this._string = value
      this._value = 1
    } else if (super.setValue(value)) {
      this._string = null
    } else {
      return false
    }
    return true
  }

  reset(goal?: string) {
    if (goal) {
      this._toString = createInterpolator({
        output: [this.getValue(), goal],
      })
    }
    this._value = 0
    super.reset()
  }
}
