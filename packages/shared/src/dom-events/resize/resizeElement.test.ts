import { resizeElement } from './resizeElement'

describe('resizeElement', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  const observeOnce = (target: HTMLElement) =>
    new Promise<{ width: number; height: number }>(resolve => {
      const cleanup = resizeElement(rect => {
        cleanup()
        resolve({ width: rect.width, height: rect.height })
      }, target)
    })

  it('reports the border-box size, including padding and border', async () => {
    const target = document.createElement('div')
    target.style.cssText =
      'width: 100px; height: 100px; padding: 20px; border: 5px solid; box-sizing: content-box;'
    document.body.appendChild(target)

    try {
      const size = await observeOnce(target)

      // content-box 100x100 + padding 20 + border 5 = border-box 150x150
      expect(size).toEqual({ width: 150, height: 150 })
    } finally {
      target.remove()
    }
  })

  it('maps inline/block to width/height for vertical writing modes', async () => {
    const target = document.createElement('div')
    target.style.cssText =
      'width: 100px; height: 200px; writing-mode: vertical-rl; box-sizing: border-box;'
    document.body.appendChild(target)

    try {
      const size = await observeOnce(target)

      expect(size).toEqual({ width: 100, height: 200 })
    } finally {
      target.remove()
    }
  })
})
