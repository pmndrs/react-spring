import type { OnResizeCallback } from '.'

let observer: ResizeObserver | undefined

const resizeHandlers = new WeakMap<Element, Set<OnResizeCallback>>()

const getBorderBoxSize = (entry: ResizeObserverEntry) => {
  // `borderBoxSize` is an array in modern browsers and a plain object in
  // older Firefox; both expose `inlineSize`/`blockSize`. Fall back to
  // `contentRect` when the entry doesn't carry border-box data.
  const boxSize = Array.isArray(entry.borderBoxSize)
    ? entry.borderBoxSize[0]
    : (entry.borderBoxSize as unknown as ResizeObserverSize | undefined)

  if (!boxSize) return entry.contentRect

  // `contentRect` always reports visual width/height regardless of writing
  // mode; `inlineSize`/`blockSize` are logical, so flip them back for
  // vertical/sideways writing modes to keep the public shape consistent.
  const writingMode = getComputedStyle(entry.target).writingMode
  const isVertical =
    writingMode.startsWith('vertical-') || writingMode.startsWith('sideways-')

  return isVertical
    ? { width: boxSize.blockSize, height: boxSize.inlineSize }
    : { width: boxSize.inlineSize, height: boxSize.blockSize }
}

const handleObservation = (entries: ResizeObserverEntry[]) =>
  entries.forEach(entry => {
    return resizeHandlers
      .get(entry.target)
      ?.forEach(handler => handler(getBorderBoxSize(entry)))
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
    observer.observe(target, { box: 'border-box' })
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
