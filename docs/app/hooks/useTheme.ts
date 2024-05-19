import { useFetchers } from '@remix-run/react'
import { useHints } from './useHints'
import { useRequestInfo } from './useRequestInfo'

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
  const fetchers = useFetchers()
  const themeFetcher = fetchers.find(f => f.formAction === '/')

  if (themeFetcher && themeFetcher.formData) {
    return themeFetcher.formData.get('theme') as string
  }
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
  const hints = useHints()
  const requestInfo = useRequestInfo()
  const optimisticMode = useOptimisticThemeMode()
  if (optimisticMode) {
    return optimisticMode === 'system' ? hints?.theme : optimisticMode
  }
  return requestInfo?.userPrefs.theme ?? hints?.theme
}
