import { useEffect, useLayoutEffect } from 'react'

import { isSSR } from '../helpers'

/**
 * Use this to read layout from the DOM and synchronously
 * re-render if the isSSR returns true. Updates scheduled
 * inside `useIsomorphicLayoutEffect` will be flushed
 * synchronously in the browser, before the browser has
 * a chance to paint.
 */
export const useIsomorphicLayoutEffect = isSSR() ? useEffect : useLayoutEffect
