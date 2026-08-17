import { raf } from '@react-spring/rafz'
import { onResize } from '../resize'

import { ScrollInfo, ScrollHandler } from './ScrollHandler'

export type OnScrollCallback = (info: ScrollInfo) => void

export type OnScrollOptions = {
  /**
   * The root container to measure against
   */
  container?: HTMLElement
}

// Shared options used for both addEventListener and removeEventListener.
// Must be passed to both calls for correct listener matching in strict
// environments, otherwise removeEventListener silently no-ops (#2384).
const passiveOptions: AddEventListenerOptions = { passive: true }

const scrollListeners = new WeakMap<Element, () => boolean>()
const resizeListeners = new WeakMap<Element, VoidFunction>()
const onScrollHandlers = new WeakMap<Element, Set<ScrollHandler>>()

const getTarget = (container: HTMLElement) =>
  container === document.documentElement ? window : container

export const onScroll = (
  callback: OnScrollCallback,
  { container = document.documentElement }: OnScrollOptions = {}
) => {
  /**
   * get the current handlers for the target
   */
  let containerHandlers = onScrollHandlers.get(container)

  /**
   * If there aren't any handlers then create a new set.
   */
  if (!containerHandlers) {
    containerHandlers = new Set()
    onScrollHandlers.set(container, containerHandlers)
  }

  /**
   * Create a new ScrollHandler class and add it to the set.
   */
  const containerHandler = new ScrollHandler(callback, container)
  containerHandlers.add(containerHandler)

  /**
   * If there are no scrollListeners then we need to make them
   */
  if (!scrollListeners.has(container)) {
    /**
     * Return true so RAFZ continues to run it
     */
    const listener = () => {
      containerHandlers?.forEach(handler => handler.advance())
      return true
    }

    scrollListeners.set(container, listener)

    const target = getTarget(container)

    /**
     * Add resize handlers so we can correctly calculate the
     * scroll position on changes
     */
    window.addEventListener('resize', listener, passiveOptions)

    if (container !== document.documentElement) {
      resizeListeners.set(container, onResize(listener, { container }))
    }

    /**
     * Add the actual scroll listener
     */
    target.addEventListener('scroll', listener, passiveOptions)
  }

  /**
   * Start animation loop
   */
  const animateScroll = scrollListeners.get(container)!
  raf(animateScroll)

  return () => {
    /**
     * Clear it on cleanup
     */
    raf.cancel(animateScroll)

    /**
     * Check if we even have any handlers for this container.
     */
    const containerHandlers = onScrollHandlers.get(container)
    if (!containerHandlers) return

    containerHandlers.delete(containerHandler)

    if (containerHandlers.size) return

    /**
     * If no more handlers, remove the scroll listener too.
     */
    const listener = scrollListeners.get(container)
    scrollListeners.delete(container)

    if (listener) {
          // Match the options used by addEventListener, otherwise the listener
          // is not removed in strict environments (see #2384).
          getTarget(container).removeEventListener('scroll', listener, passiveOptions)
          window.removeEventListener('resize', listener, passiveOptions)

          resizeListeners.get(container)?.()
        }
  }
}
