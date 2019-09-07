import { InterpolatorArgs, OneOrMore, InterpolatorFn } from 'shared/types'
import { AnimatedValue, Dependency } from '@react-spring/animated'
import { createInterpolator, toArray, is, each } from 'shared'
import { Spring } from './Spring'

/**
 * `To` springs are memoized interpolators that react to their dependencies.
 *  The memoized result is updated whenever a dependency changes.
 */
export class To<In = any, Out = any> extends Spring<Out, 'to'> {
  /** @internal The sources providing input values */
  source: OneOrMore<Dependency> | null
  /** @internal The function that maps inputs values to output */
  calc: InterpolatorFn<In, Out>
  /** @internal This node caches the tween output. Use the `get` method instead of this. */
  node: AnimatedValue<Out>

  constructor(source: OneOrMore<Dependency>, args: InterpolatorArgs<In, Out>) {
    super('to')
    this.source = source
    this.calc = createInterpolator(...args)
    this.node = new AnimatedValue(this._compute())

    // By default, update immediately when a source changes.
    this.animation = { owner: this, immediate: true } as any
    each(toArray(source), source => source.addChild(this))
  }

  _animateTo(value: Out | Dependency<Out>) {
    if (this.source) {
      each(toArray(this.source), source => source.removeChild(this))
      this._onParentChange = super._onParentChange
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

  // TODO: only compute once per frame
  protected _onParentChange(_value: any, finished: boolean) {
    super._onParentChange(this._compute(), finished)
  }
}

createInterpolator([0, 1], [1, 0])
