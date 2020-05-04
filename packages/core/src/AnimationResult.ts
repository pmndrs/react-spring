import { SpringPhase } from './SpringPhase'
import { SpringStopFn } from './types'

/** @internal */
export interface AnimationTarget<T> {
  get(): T
  is(phase: SpringPhase): boolean
  start(props: any): AsyncResult<T>
  stop: SpringStopFn<any>
}

/** The object given to the `onRest` prop and `start` promise. */
export interface AnimationResult<T = any> {
  value: T
  target?: AnimationTarget<T>
  /** When true, no animation ever started. */
  noop?: boolean
  /** When true, the animation was neither cancelled nor stopped prematurely. */
  finished?: boolean
  /** When true, the animation was cancelled before it could finish. */
  cancelled?: boolean
}

/** The promised result of an animation. */
export type AsyncResult<T = any> = Promise<AnimationResult<T>>

/** @internal */
export const getCombinedResult = <T>(
  target: AnimationTarget<T>,
  results: AnimationResult<T>[]
): AnimationResult<T> =>
  results.length == 1
    ? results[0]
    : results.some(result => result.cancelled)
    ? getCancelledResult(target)
    : results.every(result => result.noop)
    ? getNoopResult(target)
    : getFinishedResult(
        target,
        results.every(result => result.finished)
      )

/** No-op results are for updates that never start an animation. */
export const getNoopResult = <T>(
  target: AnimationTarget<T>,
  value = target.get()
) => ({
  value,
  noop: true,
  finished: true,
  target,
})

export const getFinishedResult = <T>(
  target: AnimationTarget<T>,
  finished: boolean,
  value = target.get()
) => ({
  value,
  finished,
  target,
})

export const getCancelledResult = <T>(
  target: AnimationTarget<T>,
  value = target.get()
) => ({
  value,
  cancelled: true,
  target,
})
