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
export class Controller<State extends Indexable = {}> {
  id = nextId++

  /** The prop cache for state keeping  */
  props: CachedProps<State> = {}

  /** The default props inherited by every spring. */
  defaultProps = {}

  /** The spring values that manage their animations */
  springs: Indexable<SpringValue> = {}

  /** The values that changed in the last animation frame */
  frame: LatestValues<State> = {}

  constructor(props?: SpringProps<State>) {
    this._onChange = this._onChange.bind(this)
    this._onFrame = this._onFrame.bind(this)
    if (props) {
      this.update(props).start()
    }
  }

  /** Get the latest values of every spring */
  get(): State & UnknownProps

  /** Get the latest value of a spring by key */
  get<P extends keyof State>(key: P): State[P]

  /** @internal */
  get(key?: string) {
    if (is.und(key)) {
      const values: any = {}
      each(this.springs, (spring, key) => {
        values[key] = spring.get()
      })
      return values
    }
    return this.springs[key].get()
  }

  /** Push an update onto the queue of each value. */
  update(propsArg: SpringProps<State> | Falsy) {
    if (!propsArg) return this
    const props: any = interpolateTo(propsArg)
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

    if (is.obj(from)) {
      addValidKeys(from)
    } else {
      props.from = undefined
    }

    if (keys.size) {
      each(keys, key => {
        let spring = this.springs[key]
        if (!spring) {
          // TODO: pass default props?
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

    if (is.arr(to) || is.fun(to)) {
      runAsync(
        to,
        props,
        this.props,
        () => this.get(),
        props => this.update(props as any).start(),
        this.stop.bind(this) as any
      )
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
    if (arguments.length) {
      each(toArray(keys), key => this.springs[key].stop())
    } else {
      each(this.springs, spring => spring.stop())
    }
  }

  /** Destroy every spring in this controller */
  dispose() {
    each(this.springs, spring => spring.dispose())
    this.springs = {}
    this.frame = {}
  }

  /** @internal Attached as an observer to every spring */
  protected _onChange(value: any, spring: SpringValue) {
    this.frame[spring.key as keyof State] = value
    G.frameLoop.onFrame(this._onFrame)
  }

  /** @internal Called at the end of every animation frame */
  private _onFrame() {
    if (Object.keys(this.frame).length) {
      if (this.props.onFrame) {
        this.props.onFrame(this.frame)
      }
      this.frame = {}
    }
  }
}
