import { each, Lookup, UnknownProps } from '@react-spring/shared'
import { Controller } from './Controller'
import { getProps } from './helpers'
import {
  SpringStartFn,
  SpringStopFn,
  SpringPauseFn,
  SpringResumeFn,
  SpringsUpdate,
} from './types'

/**
 * The object attached to the `ref` prop by the `useSprings` hook.
 *
 * The `T` parameter should only contain animated props.
 */
export interface SpringHandle<T extends Lookup = UnknownProps> {
  controllers: ReadonlyArray<Controller<T>>
  update: (props: SpringsUpdate<T>) => SpringHandle<T>
  start: SpringStartFn<T>
  stop: SpringStopFn<T>
  pause: SpringPauseFn<T>
  resume: SpringResumeFn<T>
}

/** Create an imperative API for manipulating an array of `Controller` objects. */
export const SpringHandle = {
  create: (getControllers: () => Controller[]): SpringHandle => ({
    get controllers() {
      return getControllers()
    },
    update(props) {
      each(getControllers(), (ctrl, i) => {
        ctrl.update(getProps(props, i, ctrl))
      })
      return this
    },
    async start(props) {
      const results = await Promise.all(
        getControllers().map((ctrl, i) => {
          const update = getProps(props, i, ctrl)
          return ctrl.start(update)
        })
      )
      return {
        value: results.map(result => result.value),
        finished: results.every(result => result.finished),
      }
    },
    stop: keys => each(getControllers(), ctrl => ctrl.stop(keys)),
    pause: keys => each(getControllers(), ctrl => ctrl.pause(keys)),
    resume: keys => each(getControllers(), ctrl => ctrl.resume(keys)),
  }),
}
