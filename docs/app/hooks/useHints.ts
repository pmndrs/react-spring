import { useRequestInfo } from './useRequestInfo'

/**
 * @returns an object with the client hints and their values
 */
export function useHints() {
  const requestInfo = useRequestInfo()
  return requestInfo?.hints
}
