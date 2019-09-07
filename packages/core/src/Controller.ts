import { is, each, OneOrMore, toArray } from 'shared'
import {
  AnimationProps,
  SpringAsyncFn,
  SpringUpdate,
  ToProp,
} from './types/spring'
import { StringKeys, Indexable, Falsy } from './types/common'
import { interpolateTo, InterpolateTo } from './helpers'
import { Spring } from './Spring'

type UpdateProps<State extends Indexable> = Partial<State> &
  AnimationProps<State> & {
    to?: ToProp<State> | Falsy
    from?: Partial<State> | Falsy
  }

type AsyncTo<State extends Indexable> =
  | readonly SpringUpdate<State>[]
  | SpringAsyncFn<State>

let nextId = 1
export class Controller<State extends Indexable = any> {
  id = nextId++
  springs: Indexable<Spring> = {}
  asyncTo?: AsyncTo<State>

  constructor(props?: UpdateProps<State>) {
    if (props) this.update(props).start()
  }

  /** Push an update onto the queue of every spring. */
  update(propsArg: UpdateProps<State> | Falsy) {
    if (!propsArg) return this
    const props = interpolateTo(propsArg)
    const { from, to } = props

    // Collect every key in "to" and "from" to create Spring objects with.
    const keys = new Set<string>()

    if (is.obj(to)) {
      each(Object.keys(to), key => keys.add(key))
    } else {
      props.to = undefined
    }

    if (is.obj(from)) {
      each(Object.keys(from), key => keys.add(key))
    } else {
      props.from = undefined
    }

    if (keys.size) {
      each(keys, key => {
        const spring =
          this.springs[key] || (this.springs[key] = new Spring(key))
        spring.push(props)
      })
    } else {
      each(this.springs, spring => {
        spring.push(props)
      })
    }

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

  /** Stop one animation or all animations */
  stop(keys?: OneOrMore<StringKeys<State>>) {
    if (arguments.length) {
      each(toArray(keys), key => this.springs[key].stop())
    } else {
      each(this.springs, spring => spring.stop())
    }
    return this
  }

  /** Destroy every spring in this controller */
  dispose() {
    each(this.springs, spring => spring.dispose())
    this.springs = {}
  }

  // Start an async chain or an async script.
  private async _runAsync(
    to: UpdateProps<State>[] | SpringAsyncFn<State>,
    props: InterpolateTo<UpdateProps<State>>
  ) {
    // Async scripts can be declaratively cancelled.
    if (props.cancel === true) {
      this.asyncTo = undefined
      return
    }

    // Equal async "to" props are no-ops.
    if (to === this.asyncTo) {
      return // TODO: should this return the same promise?
    }

    this.asyncTo = to
    const isCancelled = () => to !== this.asyncTo

    let last: Promise<any>
    const next = (props: UpdateProps<State>) => {
      if (isCancelled()) throw this
      if (is.fun(props.to) || is.arr(props.to)) {
        const parentTo = this.asyncTo
        last = this._runAsync(to, props).then(() => {
          if (to == this.asyncTo) {
            this.asyncTo = parentTo
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
