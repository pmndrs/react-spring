import { AnimatedValue } from '@react-spring/animated'
import { createInterpolator, toArray, is, each } from 'shared'
import {
  InterpolatorArgs,
  OneOrMore,
  InterpolatorFn,
  FluidValue,
} from 'shared/types'

import { SpringValue } from './SpringValue'

/**
 * `To` springs are memoized interpolators that react to their dependencies.
 *  The memoized result is updated whenever a dependency changes.
 */
export class To<In = any, Out = any> extends SpringValue<Out, 'to'> {
  /** The sources providing input values */
  source: OneOrMore<FluidValue> | null

  /** The function that maps inputs values to output */
  calc: InterpolatorFn<In, Out>

  constructor(source: OneOrMore<FluidValue>, args: InterpolatorArgs<In, Out>) {
    super('to')
    this.source = source
    this.calc = createInterpolator(...args)
    this.node = new AnimatedValue(this._compute())

    // By default, update immediately when a source changes.
    this.animation = { owner: this, immediate: true } as any
    each(toArray(source), source => {
      this.priority = Math.max(this.priority || 0, (source.priority || 0) + 1)
      source.addChild(this)
    })
  }

  _animateTo(value: Out | FluidValue<Out>) {
    if (this.source) {
      each(toArray(this.source), source => source.removeChild(this))
      this.onParentChange = super.onParentChange
      this.source = null
    }
    super._animateTo(value)
  }

  protected _compute() {
    const inputs = is.arr(this.source)
      ? this.source.map(node => node.get())
      : toArray(this.source!.get())
    return this.calc(...inputs)
  }

  /** @internal */
  onParentChange(_value: any, finished: boolean) {
    // TODO: only compute once per frame
    super.onParentChange(this._compute(), finished)
  }

  /** @internal */
  onParentPriorityChange(priority: number) {
    if (this.source) {
      let max = 0
      each(
        toArray(this.source),
        source => source && (max = Math.max(max, (source.priority || 0) + 1))
      )
      priority = max
    }
    this._setPriority(priority)
  }
}
