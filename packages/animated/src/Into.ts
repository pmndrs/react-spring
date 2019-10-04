import { createInterpolator, toArray, is, isEqual, each } from 'shared'
import {
  InterpolatorArgs,
  OneOrMore,
  InterpolatorFn,
  FluidValue,
  Arrify,
  FluidObserver,
} from 'shared/types'

import { AnimatedValue } from './AnimatedValue'
import { AnimationValue, isAnimationValue } from './AnimationValue'

/**
 * `Into` springs are memoized interpolators that react to their dependencies.
 *  The memoized result is updated whenever a dependency changes.
 */
export class Into<In = any, Out = any> extends AnimationValue<Out>
  implements FluidObserver {
  /** Useful for debugging. */
  key?: string

  /** @internal */
  readonly node: AnimatedValue<Out>

  /** The function that maps inputs values to output */
  readonly calc: InterpolatorFn<In, Out>

  constructor(
    /** The source of input values */
    readonly source: OneOrMore<FluidValue>,
    args: InterpolatorArgs<In, Out>
  ) {
    super()
    this.calc = createInterpolator(...args)
    this.node = new AnimatedValue(this._compute())
  }

  get idle() {
    return this.node.done
  }

  protected _compute() {
    const inputs: Arrify<In> = is.arr(this.source)
      ? this.source.map(node => node.get())
      : (toArray(this.source.get()) as any)
    return this.calc(...inputs)
  }

  protected _attach() {
    // Start observing our "source" once we have an observer.
    let idle = true
    let priority = 0
    each(toArray(this.source), source => {
      if (isAnimationValue(source) && !source.idle) {
        idle = false
      }
      priority = Math.max(priority, (source.priority || 0) + 1)
      source.addChild(this)
    })
    this.priority = priority
    if (!idle) {
      this.node.reset(!this.node.done)
    }
  }

  protected _detach() {
    // Stop observing our "source" once we have no observers.
    each(toArray(this.source), source => {
      source.removeChild(this)
    })
  }

  /** @internal */
  onParentChange(_value: any, idle: boolean) {
    const { node } = this
    if (idle && !node.done) {
      // We're not idle until every source is idle.
      node.done = toArray(this.source).every(
        source => !isAnimationValue(source) || source.idle
      )
    }

    // TODO: only compute once per frame (note: we'll need to call "onParentChange")
    const value = this._compute()
    if (!isEqual(value, this.get())) {
      node.setValue(value)
      this._onChange(value, node.done)
    }
  }

  /** @internal */
  onParentPriorityChange(_priority: number) {
    // Set our priority to 1 + the highest parent.
    this.priority = toArray(this.source).reduce(
      (max, source) => Math.max(max, (source.priority || 0) + 1),
      0
    )
  }
}
