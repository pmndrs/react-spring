import { RefObject } from 'react'
import { SpringHandle } from './useSpring'

export function useChain(
  refs: ReadonlyArray<RefObject<SpringHandle>>,
  timeSteps?: number[],
  timeFrame?: number
): void
