import { is, each, OneOrMore, toArray } from 'shared'
import { interpolateTo, InterpolateTo } from './helpers'
import { AsyncTo, SpringProps } from './types/spring'
import { Indexable, Falsy } from './types/common'
import { SpringValue } from './SpringValue'
import * as G from 'shared/globals'

/** The latest values of a `Controller` object */
type LatestValues<State extends Indexable> = Partial<State>

/** The props that are cached by `Controller` objects */
type CachedProps<State extends Indexable> = {
  to?: AsyncTo<State>
  onFrame?: (frame: LatestValues<State>) => void
}

let nextId = 1
export class Controller<State extends Indexable = any> {
  id = nextId++

  /** The current props stored for this controller. This does *not* contain  */
  props: CachedProps<State> = {}

  /** The spring values that manage their animations */
  springs: Indexable<SpringValue> = {}

  /** The current values from the most recent animation frame */
  frame: LatestValues<State> = {}

  /** Stop the frame listener */
  private _stop: () => void

  constructor(props?: SpringProps<State>) {
    this._stop = G.frameLoop.onFrame(this._onFrame.bind(this))
    this._onChange = this._onChange.bind(this)
    if (props) {
      this.update(props).start()
    }
  }

  /** Push an update onto the queue of each value. */
  update(propsArg: SpringProps<State> | Falsy) {
    if (!propsArg) return this
    const props = interpolateTo(propsArg)
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

    // TODO: respect "delay" prop if its a number
    if (is.arr(to) || is.fun(to)) {
      this._runAsync(to, props)
    }

    return this
  }

  /**
   * Flush the update queue of every spring, and resolve the returned promise
   * once all updates have finished (if ever).
   */
  start() {
    return Promise.all(
      Object.values(this.springs).map(spring => spring.start())
    )
  }

  /** Stop one animation, some animations, or all animations */
  stop(keys?: OneOrMore<string>) {
    if (arguments.length) {
      each(toArray(keys), key => this.springs[key].stop())
    } else {
      each(this.springs, spring => spring.stop())
    }
    return this
  }

  /** Destroy every spring in this controller */
  dispose() {
    this._stop()
    each(this.springs, spring => spring.dispose())
    this.springs = {}
  }

  /** @internal Attached as an observer to every spring */
  protected _onChange(value: any, spring: SpringValue) {
    this.frame[spring.key as keyof State] = value
  }

  /** @internal Called at the end of every animation frame */
  private _onFrame() {
    const { frame } = this
    if (Object.keys(frame).length) {
      if (this.props.onFrame) {
        this.props.onFrame(frame)
      }
      this.frame = {}
    }
  }

  // Start an async chain or an async script.
  private async _runAsync(
    to: AsyncTo<State>,
    props: InterpolateTo<SpringProps<State>>
  ) {
    // Async scripts can be declaratively cancelled.
    if (props.cancel === true) {
      this.props.to = undefined
      return
    }

    // Equal async "to" props are no-ops.
    if (to === this.props) {
      return // TODO: should this return the same promise?
    }

    const isCancelled = () => to !== this.props.to

    let last: Promise<any>
    const next = (props: SpringProps<State>) => {
      if (isCancelled()) throw this
      const { to } = props
      if (is.fun(to) || is.arr(to)) {
        const parentTo = this.props.to
        last = this._runAsync(to, props).then(() => {
          if (to == this.props.to) {
            this.props.to = parentTo
          }
        })
      } else {
        last = this.update(props).start()
      }
      return last.then(() => {
        if (isCancelled()) throw this
      })
    }

    let queue = Promise.resolve()

    // Async sequence
    if (is.arr(to)) {
      queue = queue.then(async () => {
        for (const props of to) {
          if (props) {
            await next(props)
          }
        }
      })
    }

    // Async script
    else if (is.fun(to)) {
      queue = queue.then(() =>
        to(next, this.stop.bind(this))
          // Always wait for the last update.
          .then(() => last)
      )
    }

    return queue.catch(err => {
      if (err !== this) console.error(err)
    })
  }
}
