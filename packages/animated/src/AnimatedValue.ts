import { is } from 'shared'
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
   * rounding to the pixel grid like this:
   *
   *     config: { step: 1 / window.devicePixelRatio },
   */
  setValue(value: T, step?: number) {
    if (is.num(value)) {
      this.lastPosition = value
      if (step) {
        value = roundToStep(value, step) as any
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

  reset(isActive?: boolean, _goal?: T) {
    this.done = false
    if (is.num(this._value)) {
      this.elapsedTime = 0
      this.lastPosition = this._value
      if (!isActive) this.lastVelocity = null
      this.v0 = null
    }
  }
}

/**
 * The `roundToStep` function works with fractional steps *and* whole steps.
 *
 */
function roundToStep(n: number, step: number) {
  n = Math.round(n / step) * step

  // Determine the number of decimals to round.
  let p = 0
  if (n % 1) {
    const s = String(n)
    p = s.length - s.indexOf('.') - 1
  }

  if (p) {
    const q = Math.pow(10, p)
    return Math.round(q * n + q / 1e16) / q
  }
  return n
}
