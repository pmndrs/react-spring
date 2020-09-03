import { each, is } from '@react-spring/shared'
import { Lookup, Falsy, OneOrMore } from '@react-spring/types'
import { AsyncResult, ControllerUpdate } from './types'
import { Controller } from './Controller'

interface ControllerUpdateFn<State extends Lookup = Lookup> {
  (ctrl: Controller<State>): ControllerUpdate<State> | Falsy
}

export class SpringRef<State extends Lookup = Lookup> {
  readonly current = new Set<Controller<State>>()

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
    each(this.current, ctrl => {
      const update = is.fun(props) ? props(ctrl) : props
      if (update) {
        results.push(ctrl.start(update))
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
    each(this.current, ctrl => {
      ctrl.update(is.fun(props) ? props(ctrl) : props)
    })
    return this
  }
}

export interface SpringRef<State extends Lookup> {
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
  } as any
})
