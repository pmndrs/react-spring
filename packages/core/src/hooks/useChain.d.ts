import { RefObject } from 'react'
import { SpringHandle } from '../types'

export declare function useChain(
  refs: ReadonlyArray<RefObject<SpringHandle>>,
  timeSteps?: number[],
  timeFrame?: number
): void
