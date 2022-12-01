let observer: ResizeObserver | undefined

const resizeHandlers = new WeakMap<Element, Set<VoidFunction>>()

const handleObservation = (entries: ResizeObserverEntry[]) =>
  entries.forEach(({ target }) =>
    resizeHandlers.get(target)?.forEach(handler => handler())
  )

export function onResize(target: HTMLElement, handler: VoidFunction) {
  /**
   * If there's a resize observer in the ENV then use that too.
   */
  if (!observer) {
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleObservation)
    }
  }

  /**
   * Fetch the handlers for the target
   */
  let elementHandlers = resizeHandlers.get(target)

  /**
   * If there are no handlers create a new set for the target
   * and then add to the map
   */
  if (!elementHandlers) {
    elementHandlers = new Set()
    resizeHandlers.set(target, elementHandlers)
  }

  /**
   * Add the handler to the target's set
   * and observe the target if possible.
   */
  elementHandlers.add(handler)

  if (observer) {
    observer.observe(target)
  }

  /**
   * Cleanup the event handlers and potential observers.
   */
  return () => {
    const elementHandlers = resizeHandlers.get(target)

    if (!elementHandlers) return

    elementHandlers.delete(handler)

    if (!elementHandlers.size && observer) {
      observer.unobserve(target)
    }
  }
}
