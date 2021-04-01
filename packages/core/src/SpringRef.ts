import { each, is, deprecateDirectCall } from '@react-spring/shared'
import { Lookup, Falsy, OneOrMore } from '@react-spring/types'
import { AsyncResult, ControllerUpdate } from './types'
import { Controller } from './Controller'

interface ControllerUpdateFn<State extends Lookup = Lookup> {
  (i: number, ctrl: Controller<State>): ControllerUpdate<State> | Falsy
}

/**
 * Extending from function allows SpringRef instances to be callable.
 * https://hackernoon.com/creating-callable-objects-in-javascript-d21l3te1
 *
 * ```js
 * const [springs, api] = useSpring(() => ({x: 0}))
 * api.start({x: 3}) // this works
 * api({x: 3}) // this also works (non breaking from 9rc3)
 * ```
 */
export class SpringRef<State extends Lookup = Lookup> extends Function {
  readonly current: Controller<State>[] = []

  constructor() {
    super('return arguments.callee._call.apply(arguments.callee, arguments)')
  }

  /** @deprecated use the property 'start' instead */
  _call(props?: ControllerUpdate<State> | ControllerUpdateFn<State>) {
    deprecateDirectCall()
    this.start(props)
  }

  /** Update the state of each controller without animating. */
  set(values: Partial<State>) {
    each(this.current, ctrl => ctrl.set(values))
  }

  /** Start the queued animations of each controller. */
  start(): AsyncResult<Controller<State>>[]
  /** Update every controller with the same props. */
  start(props: ControllerUpdate<State>): AsyncResult<Controller<State>>[]
  /** Update controllers based on their state. */
  start(props: ControllerUpdateFn<State>): AsyncResult<Controller<State>>[]
  /** Start animating each controller. */
  start(
    props?: ControllerUpdate<State> | ControllerUpdateFn<State>
  ): AsyncResult<Controller<State>>[]
  /** @internal */
  start(props?: object | ControllerUpdateFn<State>) {
    const results: AsyncResult[] = []

    each(this.current, (ctrl, i) => {
      if (is.und(props)) {
        results.push(ctrl.start())
      } else {
        const update = this._getProps(props, ctrl, i)
        if (update) {
          results.push(ctrl.start(update))
        }
      }
    })

    return results
  }

  /** Add the same props to each controller's update queue. */
  update(props: ControllerUpdate<State>): this
  /** Generate separate props for each controller's update queue. */
  update(props: ControllerUpdateFn<State>): this
  /** Add props to each controller's update queue. */
  update(props: ControllerUpdate<State> | ControllerUpdateFn<State>): this
  /** @internal */
  update(props: object | ControllerUpdateFn<State>) {
    each(this.current, (ctrl, i) => ctrl.update(this._getProps(props, ctrl, i)))
    return this
  }

  /** Add a controller to this ref */
  add(ctrl: Controller<State>) {
    if (!this.current.includes(ctrl)) {
      this.current.push(ctrl)
    }
  }

  /** Remove a controller from this ref */
  delete(ctrl: Controller<State>) {
    const i = this.current.indexOf(ctrl)
    if (~i) this.current.splice(i, 1)
  }

  /** Overridden by `useTrail` to manipulate props */
  protected _getProps(
    arg: ControllerUpdate<State> | ControllerUpdateFn<State>,
    ctrl: Controller<State>,
    index: number
  ): ControllerUpdate<State> | Falsy {
    return is.fun(arg) ? arg(index, ctrl) : arg
  }
}

export interface SpringRef<State extends Lookup> {
  (props?: ControllerUpdate<State> | ControllerUpdateFn<State>): AsyncResult<
    Controller<State>
  >[]
  /** Stop all animations. */
  stop(): this
  /** Stop animations for the given keys. */
  stop(keys: OneOrMore<string>): this
  /** Cancel all animations. */
  stop(cancel: boolean): this
  /** Cancel animations for the given keys. */
  stop(cancel: boolean, keys: OneOrMore<string>): this
  /** Stop some or all animations. */
  stop(keys?: OneOrMore<string>): this
  /** Cancel some or all animations. */
  stop(cancel: boolean, keys?: OneOrMore<string>): this

  /** Pause all animations. */
  pause(): this
  /** Pause animations for the given keys. */
  pause(keys: OneOrMore<string>): this
  /** Pause some or all animations. */
  pause(keys?: OneOrMore<string>): this

  /** Resume all animations. */
  resume(): this
  /** Resume animations for the given keys. */
  resume(keys: OneOrMore<string>): this
  /** Resume some or all animations. */
  resume(keys?: OneOrMore<string>): this
}

each(['stop', 'pause', 'resume'] as const, key => {
  SpringRef.prototype[key] = function (this: SpringRef) {
    each(this.current, ctrl => ctrl[key](...arguments))
    return this
  } as any
})
