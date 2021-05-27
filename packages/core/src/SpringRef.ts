import { each, is, deprecateDirectCall } from '@react-spring/shared'
import { Lookup, Falsy, OneOrMore } from '@react-spring/types'
import { AsyncResult, ControllerUpdate } from './types'
import { Controller } from './Controller'

interface ControllerUpdateFn<State extends Lookup = Lookup> {
  (i: number, ctrl: Controller<State>): ControllerUpdate<State> | Falsy
}

export interface SpringRef<State extends Lookup = Lookup> {
  (props?: ControllerUpdate<State> | ControllerUpdateFn<State>): AsyncResult<
    Controller<State>
  >[]
  current: Controller<State>[]

  /** Add a controller to this ref */
  add(ctrl: Controller<State>): void

  /** Remove a controller from this ref */
  delete(ctrl: Controller<State>): void

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

  /** Update the state of each controller without animating. */
  set(values: Partial<State>): void

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

  /** Add the same props to each controller's update queue. */
  update(props: ControllerUpdate<State>): this
  /** Generate separate props for each controller's update queue. */
  update(props: ControllerUpdateFn<State>): this
  /** Add props to each controller's update queue. */
  update(props: ControllerUpdate<State> | ControllerUpdateFn<State>): this

  _getProps(
    arg: ControllerUpdate<State> | ControllerUpdateFn<State>,
    ctrl: Controller<State>,
    index: number
  ): ControllerUpdate<State> | Falsy
}

export const SpringRef = <
  State extends Lookup = Lookup
>(): SpringRef<State> => {
  const current: Controller<State>[] = []

  const SpringRef: SpringRef<State> = function (props) {
    deprecateDirectCall()

    const results: AsyncResult[] = []

    each(current, (ctrl, i) => {
      if (is.und(props)) {
        results.push(ctrl.start())
      } else {
        const update = _getProps(props, ctrl, i)
        if (update) {
          results.push(ctrl.start(update))
        }
      }
    })

    return results
  }

  SpringRef.current = current

  /** Add a controller to this ref */
  SpringRef.add = function (ctrl: Controller<State>) {
    if (!current.includes(ctrl)) {
      current.push(ctrl)
    }
  }

  /** Remove a controller from this ref */
  SpringRef.delete = function (ctrl: Controller<State>) {
    const i = current.indexOf(ctrl)
    if (~i) current.splice(i, 1)
  }

  /** Pause all animations. */
  SpringRef.pause = function () {
    each(current, ctrl => ctrl.pause(...arguments))
    return this
  }

  /** Resume all animations. */
  SpringRef.resume = function () {
    each(current, ctrl => ctrl.resume(...arguments))
    return this
  }

  /** Update the state of each controller without animating. */
  SpringRef.set = function (values: Partial<State>) {
    each(current, ctrl => ctrl.set(values))
  }

  /** @internal */
  SpringRef.start = function (props?: object | ControllerUpdateFn<State>) {
    const results: AsyncResult[] = []

    each(current, (ctrl, i) => {
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

  /** Stop all animations. */
  SpringRef.stop = function () {
    each(current, ctrl => ctrl.stop(...arguments))
    return this
  }

  /** @internal */
  SpringRef.update = function (props: object | ControllerUpdateFn<State>) {
    each(current, (ctrl, i) => ctrl.update(this._getProps(props, ctrl, i)))
    return this
  }

  /** Overridden by `useTrail` to manipulate props */
  const _getProps = function (
    arg: ControllerUpdate<State> | ControllerUpdateFn<State>,
    ctrl: Controller<State>,
    index: number
  ): ControllerUpdate<State> | Falsy {
    return is.fun(arg) ? arg(index, ctrl) : arg
  }

  SpringRef._getProps = _getProps

  return SpringRef
}
