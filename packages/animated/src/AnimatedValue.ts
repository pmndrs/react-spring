import { is } from '@react-spring/shared'
import { Animated, Payload } from './Animated'

/** An animated number or a native attribute value */
export class AnimatedValue<T = any> extends Animated {
  done = true
  elapsedTime!: number
  lastPosition!: number
  lastVelocity?: number | null
  v0?: number | null

  constructor(protected _value: T) {
    super()
    if (is.num(this._value)) {
      this.lastPosition = this._value
    }
  }

  static create<T>(from: T, _to?: T | null) {
    return new AnimatedValue(from)
  }

  getPayload(): Payload {
    return [this]
  }

  getValue() {
    return this._value
  }

  /**
   * Set the current value and optionally round it.
   *
   * The `step` argument does nothing whenever it equals `undefined` or `0`.
   * It works with fractions and whole numbers. The best use case is (probably)
   * rounding to the pixel grid with a step of:
   *
   *      1 / window.devicePixelRatio
   */
  setValue(value: T, step?: number) {
    if (is.num(value)) {
      this.lastPosition = value
      if (step) {
        value = (Math.round(value / step) * step) as any
        if (this.done) {
          this.lastPosition = value as any
        }
      }
    }
    if (this._value === value) {
      return false
    }
    this._value = value
    return true
  }

  reset() {
    const { done } = this
    this.done = false
    if (is.num(this._value)) {
      this.elapsedTime = 0
      this.lastPosition = this._value
      if (done) this.lastVelocity = null
      this.v0 = null
    }
  }
}
