import { is, each, OneOrMore, toArray, UnknownProps } from 'shared'
import * as G from 'shared/globals'

import { interpolateTo } from './helpers'
import { runAsync, RunAsyncState } from './runAsync'
import { Indexable, Falsy } from './types/common'
import { SpringProps } from './types/spring'
import { SpringValue } from './SpringValue'

/** The latest values of a `Controller` object */
type LatestValues<State extends Indexable> = Partial<State>

/** The props that are cached by `Controller` objects */
interface CachedProps<State extends Indexable> extends RunAsyncState<State> {
  onFrame?: (frame: LatestValues<State>) => void
}

let nextId = 1
export class Controller<State extends Indexable = UnknownProps> {
  readonly id = nextId++

  /** The prop cache for state keeping  */
  props: CachedProps<State> = {}

  /** The spring values that manage their animations */
  springs: Indexable<SpringValue> = {}

  /** The values that changed in the last animation frame */
  frame: LatestValues<State> = {}

  constructor(props?: SpringProps<State>) {
    this._onChange = this._onChange.bind(this)
    this._onFrame = this._onFrame.bind(this)
    if (props) {
      props.default = true
      this.update(props).start()
    }
  }

  /** Equals true when no springs are animating */
  get idle() {
    return !this.props.promise && Object.values(this.springs).every(s => s.idle)
  }

  /** Get the latest values of every spring */
  get(): State & UnknownProps {
    const values: any = {}
    each(this.springs, (spring, key) => {
      values[key] = spring.get()
    })
    return values
  }

  /** Push an update onto the queue of each value. */
  update(propsArg: SpringProps<State> | Falsy) {
    if (!propsArg) return this
    const props: any = interpolateTo(propsArg)
    const { from, to } = props

    if (is.arr(to) || is.fun(to)) {
      // Ensure springs have initial values.
      if (from) this._update({ from })
      // Start the async animation.
      runAsync<State>(
        to,
        props,
        this.props,
        () => this.get(),
        () => false, // TODO: add pausing to Controller
        ((props: any) => this.update(props).start()) as any,
        this.stop.bind(this) as any
      )
    } else {
      this._update(props)
    }

    return this
  }

  /**
   * Flush the update queue of every spring, and resolve the returned promise
   * once all updates have finished (or cancelled).
   */
  async start() {
    const results = await Promise.all(
      Object.values(this.springs).map(spring => spring.start())
    )
    return {
      finished: results.every(result => result.finished),
      value: this.get(),
    }
  }

  /** Stop one animation, some animations, or all animations */
  stop(keys?: OneOrMore<string>) {
    if (is.und(keys)) {
      each(this.springs, spring => spring.stop())
    } else {
      each(toArray(keys), key => this.springs[key].stop())
    }
  }

  /** Restart every animation. */
  reset() {
    each(this.springs, spring => spring.reset())
  }

  /** Destroy every spring in this controller */
  dispose() {
    each(this.springs, spring => spring.dispose())
    this.springs = {}
    this.frame = {}
  }

  /** Update springs whose keys are defined in the `from` or `to` prop */
  protected _update(props: SpringProps<State> & any) {
    // TODO: remove "& any" above when negated types are released
    const { from, to } = props

    // Collect every key in "to" and "from" to create "SpringValue" objects with.
    const keys = new Set<string>()
    const addValidKeys = (obj: Indexable) =>
      each(Object.keys(obj), key => {
        if (!is.und(obj[key])) keys.add(key)
      })

    if (is.obj(to)) {
      addValidKeys(to)
    } else {
      props.to = undefined
    }

    if (from) {
      addValidKeys(from)
    }

    if (keys.size) {
      each(keys, key => {
        let spring = this.springs[key]
        if (!spring) {
          this.springs[key] = spring = new SpringValue(key)
          spring.addChild(this._onChange)
        }
        spring.update(props)
      })
    } else {
      each(this.springs, spring => {
        spring.update(props)
      })
    }
  }

  /** @internal Attached as an observer to every spring */
  protected _onChange(value: any, spring: SpringValue) {
    if (this.props.onFrame) {
      this.frame[spring.key as keyof State] = value
      G.frameLoop.onFrame(this._onFrame)
    }
  }

  /** @internal Called at the end of every animation frame */
  private _onFrame() {
    if (Object.keys(this.frame).length) {
      this.props.onFrame!(this.frame)
      this.frame = {}
    }
  }
}
