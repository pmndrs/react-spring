import { AnimationResult } from './types'
import { Readable } from './types/internal'

/** @internal */
export const getCombinedResult = <T extends Readable>(
  target: T,
  results: AnimationResult<T>[]
): AnimationResult<T> =>
  results.length == 1
    ? results[0]
    : results.some(result => result.cancelled)
    ? getCancelledResult(target.get())
    : results.every(result => result.noop)
    ? getNoopResult(target.get())
    : getFinishedResult(
        target.get(),
        results.every(result => result.finished)
      )

/** No-op results are for updates that never start an animation. */
export const getNoopResult = (value: any) => ({
  value,
  noop: true,
  finished: true,
  cancelled: false,
})

export const getFinishedResult = (
  value: any,
  finished: boolean,
  cancelled: boolean = false
) => ({
  value,
  finished,
  cancelled,
})

export const getCancelledResult = (value: any) => ({
  value,
  cancelled: true,
  finished: false,
})
