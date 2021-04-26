import * as React from 'react'

declare const window: any

export const useLayoutEffect =
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
    ? React.useLayoutEffect
    : React.useEffect
