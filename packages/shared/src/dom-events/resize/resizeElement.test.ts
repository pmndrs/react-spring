import { resizeElement } from './resizeElement'

const observe = jest.fn()
const unobserve = jest.fn()
let callback: ResizeObserverCallback | undefined

class ResizeObserverMock {
  constructor(cb: ResizeObserverCallback) {
    callback = cb
  }

  observe = observe
  unobserve = unobserve
}

describe('resizeElement', () => {
  const ResizeObserver = global.ResizeObserver
  let cleanup: (() => void) | undefined

  beforeEach(() => {
    observe.mockClear()
    unobserve.mockClear()
    cleanup = undefined

    global.ResizeObserver =
      ResizeObserverMock as unknown as typeof global.ResizeObserver
  })

  afterEach(() => {
    cleanup?.()
    jest.resetAllMocks()
    global.ResizeObserver = ResizeObserver
  })

  it('observes and reports the border box size', () => {
    const target = document.createElement('div')
    const handler = jest.fn()

    cleanup = resizeElement(handler, target)

    expect(observe).toHaveBeenCalledWith(target, { box: 'border-box' })

    callback?.(
      [
        {
          target,
          borderBoxSize: [{ inlineSize: 120, blockSize: 80 }],
          contentRect: { width: 100, height: 60 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver
    )

    expect(handler).toHaveBeenCalledWith({ width: 120, height: 80 })
  })

  it('maps border box size for vertical writing modes', () => {
    const target = document.createElement('div')
    const handler = jest.fn()

    target.style.writingMode = 'vertical-rl'
    cleanup = resizeElement(handler, target)

    callback?.(
      [
        {
          target,
          borderBoxSize: [{ inlineSize: 120, blockSize: 80 }],
          contentRect: { width: 100, height: 60 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver
    )

    expect(handler).toHaveBeenCalledWith({ width: 80, height: 120 })
  })

  it('maps border box size for sideways writing modes', () => {
    const target = document.createElement('div')
    const handler = jest.fn()

    target.style.writingMode = 'sideways-rl'

    cleanup = resizeElement(handler, target)

    callback?.(
      [
        {
          target,
          borderBoxSize: [{ inlineSize: 120, blockSize: 80 }],
          contentRect: { width: 100, height: 60 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver
    )

    expect(handler).toHaveBeenCalledWith({ width: 80, height: 120 })
  })

  it('falls back to contentRect when borderBoxSize is unavailable', () => {
    const target = document.createElement('div')
    const handler = jest.fn()

    cleanup = resizeElement(handler, target)

    callback?.(
      [
        {
          target,
          contentRect: { width: 100, height: 60 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver
    )

    expect(handler).toHaveBeenCalledWith({ width: 100, height: 60 })
  })

  it('falls back when border-box observe options are unsupported', () => {
    const target = document.createElement('div')

    observe.mockImplementationOnce(() => {
      throw new TypeError('box option unsupported')
    })

    cleanup = resizeElement(jest.fn(), target)

    expect(observe).toHaveBeenNthCalledWith(1, target, { box: 'border-box' })
    expect(observe).toHaveBeenNthCalledWith(2, target)
  })

  it('does not swallow non-TypeError observe failures', () => {
    const target = document.createElement('div')
    const boom = new Error('boom')

    observe.mockImplementationOnce(() => {
      throw boom
    })

    expect(() => resizeElement(jest.fn(), target)).toThrow(boom)
    expect(observe).toHaveBeenCalledTimes(1)
  })
})
