import type { OnResizeCallback } from '.'

let observer: ResizeObserver | undefined

const resizeHandlers = new WeakMap<Element, Set<OnResizeCallback>>()

const getBorderBoxSize = (
  target: Element,
  { borderBoxSize, contentRect }: ResizeObserverEntry
): Pick<DOMRectReadOnly, 'width' | 'height'> &
  Partial<Omit<DOMRectReadOnly, 'width' | 'height'>> => {
  const boxSize = Array.isArray(borderBoxSize)
    ? borderBoxSize[0]
    : borderBoxSize

  if (boxSize) {
    const writingMode =
      getComputedStyle(target).getPropertyValue('writing-mode')
    const isOrthogonalWritingMode =
      writingMode.startsWith('vertical-') || writingMode.startsWith('sideways-')

    return isOrthogonalWritingMode
      ? {
          width: boxSize.blockSize,
          height: boxSize.inlineSize,
        }
      : {
          width: boxSize.inlineSize,
          height: boxSize.blockSize,
        }
  }

  return contentRect
}

const handleObservation = (entries: ResizeObserverEntry[]) =>
  entries.forEach(entry => {
    return resizeHandlers
      .get(entry.target)
      ?.forEach(handler => handler(getBorderBoxSize(entry.target, entry)))
  })

export function resizeElement(handler: OnResizeCallback, target: HTMLElement) {
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
    try {
      observer.observe(target, { box: 'border-box' })
    } catch (error) {
      if (!(error instanceof TypeError)) throw error

      observer.observe(target)
    }
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
