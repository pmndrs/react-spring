import { Arrify, InterpolatorArgs, InterpolatorFn } from '@react-spring/types'
import {
  is,
  raf,
  each,
  isEqual,
  toArray,
  frameLoop,
  FluidValue,
  getFluidValue,
  createInterpolator,
  Globals as G,
  callFluidObservers,
  addFluidObserver,
  removeFluidObserver,
  hasFluidValue,
} from '@react-spring/shared'

import { FrameValue, isFrameValue } from './FrameValue'
import {
  getAnimated,
  setAnimated,
  getAnimatedType,
  getPayload,
} from '@react-spring/animated'

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

  /** The inputs which are currently animating */
  protected _active = new Set<FluidValue>()

  constructor(
    /** The source of input values */
    readonly source: unknown,
    args: InterpolatorArgs<In, Out>
  ) {
    super()
    this.calc = createInterpolator(...args)

    const value = this._get()
    const nodeType = getAnimatedType(value)

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
    // Become idle when all parents are idle or paused.
    if (!this.idle && checkIdle(this._active)) {
      becomeIdle(this)
    }
  }

  protected _get() {
    const inputs: Arrify<In> = is.arr(this.source)
      ? this.source.map(getFluidValue)
      : (toArray(getFluidValue(this.source)) as any)

    return this.calc(...inputs)
  }

  protected _start() {
    if (this.idle && !checkIdle(this._active)) {
      this.idle = false

      each(getPayload(this)!, node => {
        node.done = false
      })

      if (G.skipAnimation) {
        raf.batchedUpdates(() => this.advance())
        becomeIdle(this)
      } else {
        frameLoop.start(this)
      }
    }
  }

  // Observe our sources only when we're observed.
  protected _attach() {
    let priority = 1
    each(toArray(this.source), source => {
      if (hasFluidValue(source)) {
        addFluidObserver(source, this)
      }
      if (isFrameValue(source)) {
        if (!source.idle) {
          this._active.add(source)
        }
        priority = Math.max(priority, source.priority + 1)
      }
    })
    this.priority = priority
    this._start()
  }

  // Stop observing our sources once we have no observers.
  protected _detach() {
    each(toArray(this.source), source => {
      if (hasFluidValue(source)) {
        removeFluidObserver(source, this)
      }
    })
    this._active.clear()
    becomeIdle(this)
  }

  /** @internal */
  eventObserved(event: FrameValue.Event) {
    // Update our value when an idle parent is changed,
    // and enter the frameloop when a parent is resumed.
    if (event.type == 'change') {
      if (event.idle) {
        this.advance()
      } else {
        this._active.add(event.parent)
        this._start()
      }
    }
    // Once all parents are idle, the `advance` method runs one more time,
    // so we should avoid updating the `idle` status here.
    else if (event.type == 'idle') {
      this._active.delete(event.parent)
    }
    // Ensure our priority is greater than all parents, which means
    // our value won't be updated until our parents have updated.
    else if (event.type == 'priority') {
      this.priority = toArray(this.source).reduce(
        (highest: number, parent) =>
          Math.max(highest, (isFrameValue(parent) ? parent.priority : 0) + 1),
        0
      )
    }
  }
}

/** Returns true for an idle source. */
function isIdle(source: any) {
  return source.idle !== false
}

/** Return true if all values in the given set are idle or paused. */
function checkIdle(active: Set<FluidValue>) {
  // Parents can be active even when paused, so the `.every` check
  // removes us from the frameloop if all active parents are paused.
  return !active.size || Array.from(active).every(isIdle)
}

/** Become idle if not already idle. */
function becomeIdle(self: Interpolation) {
  if (!self.idle) {
    self.idle = true

    each(getPayload(self)!, node => {
      node.done = true
    })

    callFluidObservers(self, {
      type: 'idle',
      parent: self,
    })
  }
}
