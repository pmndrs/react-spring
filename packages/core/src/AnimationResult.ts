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
    ? getCancelledResult(target)
    : results.every(result => result.noop)
    ? getNoopResult(target)
    : getFinishedResult(
        target,
        results.every(result => result.finished)
      )

/** No-op results are for updates that never start an animation. */
export const getNoopResult = <T extends Readable>(
  target: T,
  value = target.get()
) => ({
  value,
  noop: true,
  finished: true,
  target,
})

export const getFinishedResult = <T extends Readable>(
  target: T,
  finished: boolean,
  value = target.get()
) => ({
  value,
  finished,
  target,
})

export const getCancelledResult = <T extends Readable>(
  target: T,
  value = target.get()
) => ({
  value,
  cancelled: true,
  target,
})
