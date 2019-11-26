import {
  is,
  each,
  isEqual,
  toArray,
  FluidValue,
  createInterpolator,
  InterpolatorArgs,
  InterpolatorFn,
  OneOrMore,
  Arrify,
} from 'shared'
import * as G from 'shared/globals'

import { FrameValue, isFrameValue } from './FrameValue'
import {
  getAnimated,
  setAnimated,
  AnimatedValue,
  AnimatedArray,
  AnimatedType,
  getPayload,
} from 'animated'

/**
 * An `Interpolation` is a memoized value that's computed whenever one of its
 * `FluidValue` dependencies has its value changed.
 *
 * Other `FrameValue` objects can depend on this. For example, passing an
 * `Interpolation` as the `to` prop of a `useSpring` call will trigger an
 * animation toward the memoized value.
 */
export class Interpolation<In = any, Out = any> extends FrameValue<Out> {
  /** Useful for debugging. */
  key?: string

  /** Equals false when in the frameloop */
  idle = true

  /** The function that maps inputs values to output */
  readonly calc: InterpolatorFn<In, Out>

  constructor(
    /** The source of input values */
    readonly source: OneOrMore<FluidValue>,
    args: InterpolatorArgs<In, Out>
  ) {
    super()
    this.calc = createInterpolator(...args)

    const value = this._get()
    const nodeType: AnimatedType = is.arr(value) ? AnimatedArray : AnimatedValue

    // Assume the computed value never changes type.
    setAnimated(this, nodeType.create(value))
  }

  advance(_dt?: number) {
    const value = this._get()
    const oldValue = this.get()
    if (!isEqual(value, oldValue)) {
      getAnimated(this)!.setValue(value)
      this._onChange(value, this.idle)
    }
  }

  protected _get() {
    const inputs: Arrify<In> = is.arr(this.source)
      ? this.source.map(node => node.get())
      : (toArray(this.source.get()) as any)

    return this.calc(...inputs)
  }

  protected _reset() {
    each(getPayload(this)!, node => node.reset())
    super._reset()
  }

  protected _start() {
    this.idle = false

    super._start()

    if (G.skipAnimation) {
      this.idle = true
      this.advance()
    } else {
      G.frameLoop.start(this)
    }
  }

  protected _attach() {
    // Start observing our "source" once we have an observer.
    let idle = true
    let priority = 1
    each(toArray(this.source), source => {
      if (isFrameValue(source)) {
        if (!source.idle) idle = false
        priority = Math.max(priority, source.priority + 1)
      }
      source.addChild(this)
    })
    this.priority = priority
    if (!idle) {
      this._reset()
      this._start()
    }
  }

  protected _detach() {
    // Stop observing our "source" once we have no observers.
    each(toArray(this.source), source => {
      source.removeChild(this)
    })
    // This removes us from the frameloop.
    this.idle = true
  }

  /** @internal */
  onParentChange(event: FrameValue.Event) {
    if (event.type == 'change') {
      // Stay idle when a non-animated parent is changed.
      if (this.idle) {
        this.advance()
      }
      // Leave the frameloop when all parents are done animating.
      else if (event.idle) {
        this.idle = toArray(this.source).every(
          (source: any) => source.idle !== false
        )
        if (this.idle) {
          this.advance()
          each(getPayload(this)!, node => {
            node.done = true
          })
        }
      }
    }

    // Ensure our priority is greater than all parents, which means
    // our value won't be updated until our parents have updated.
    else if (event.type == 'priority') {
      this.priority = toArray(this.source).reduce(
        (max, source: any) => Math.max(max, (source.priority || 0) + 1),
        0
      )
    }
    super.onParentChange(event)
  }
}
