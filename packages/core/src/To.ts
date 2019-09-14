import { AnimatedValue } from '@react-spring/animated'
import { createInterpolator, toArray, is, each } from 'shared'
import {
  InterpolatorArgs,
  OneOrMore,
  InterpolatorFn,
  FluidValue,
  Arrify,
  FluidObserver,
} from 'shared/types'

import { SpringValue } from './SpringValue'

/**
 * `To` springs are memoized interpolators that react to their dependencies.
 *  The memoized result is updated whenever a dependency changes.
 */
export class To<In = any, Out = any> extends SpringValue<Out, 'to'> {
  /** The function that maps inputs values to output */
  readonly calc: InterpolatorFn<In, Out>

  constructor(
    /** The source of input values */
    readonly source: OneOrMore<FluidValue>,
    args: InterpolatorArgs<In, Out>
  ) {
    super('to')
    this.calc = createInterpolator(...args)
    this.node = new AnimatedValue(this._compute())

    // Update immediately when a source changes.
    this.animation = { owner: this, immediate: true } as any
  }

  protected _animate() {
    throw Error('Cannot animate a "To" spring')
  }

  protected _compute() {
    const inputs: Arrify<In> = is.arr(this.source)
      ? this.source.map(node => node.get())
      : (toArray(this.source!.get()) as any)
    return this.calc(...inputs)
  }

  /** @internal */
  addChild(observer: FluidObserver<Out>) {
    // Start observing our "source" once we have an observer.
    if (!this._children.size) {
      let priority = 0
      each(toArray(this.source), source => {
        priority = Math.max(priority, (source.priority || 0) + 1)
        source.addChild(this)
      })
      this._setPriority(priority)
    }

    super.addChild(observer)
  }

  removeChild(observer: FluidObserver<Out>) {
    super.removeChild(observer)

    // Stop observing our "source" once we have no observers.
    if (!this._children.size) {
      each(toArray(this.source), source => {
        source.removeChild(this)
      })
    }
  }

  /** @internal */
  onParentChange(_value: any, finished: boolean) {
    // TODO: only compute once per frame
    super.onParentChange(this._compute(), finished)
  }

  /** @internal */
  onParentPriorityChange(_priority: number) {
    const reducer = (max: number, source: FluidValue | undefined) =>
      source ? Math.max(max, (source.priority || 0) + 1) : max

    const max = toArray(this.source).reduce(reducer, 0)
    this._setPriority(max)
  }
}
