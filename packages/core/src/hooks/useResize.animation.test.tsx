import * as React from 'react'
import { render } from 'vitest-browser-react'

import { useResize } from './useResize'

describe('useResize animations', () => {
  let values: ReturnType<typeof useResize>

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const mount = async (immediate = false) => {
    function Component() {
      values = useResize({ immediate, config: { duration: 100 } })
      return null
    }
    return render(<Component />)
  }

  const measure = async (width: number, height: number) => {
    await React.act(() => {
      vi.stubGlobal('innerWidth', width)
      vi.stubGlobal('innerHeight', height)
      window.dispatchEvent(new Event('resize'))
    })
    await global.advance()
  }

  it('sets the first measured size immediately', async () => {
    await mount()
    await measure(100, 200)

    expect(values.width.get()).toBe(100)
    expect(values.height.get()).toBe(200)
    expect(values.width.idle).toBe(true)
    expect(values.height.idle).toBe(true)
  })

  it('animates after an initial zero-size measurement', async () => {
    await mount()
    await measure(0, 0)
    await measure(100, 200)
    await global.advanceByTime(50)

    expect(values.width.get()).toBeGreaterThan(0)
    expect(values.width.get()).toBeLessThan(100)
    expect(values.height.get()).toBeGreaterThan(0)
    expect(values.height.get()).toBeLessThan(200)
    await global.advanceUntilIdle()
    expect(values.width.get()).toBe(100)
    expect(values.height.get()).toBe(200)
  })

  it('animates when expanding again after collapsing to zero', async () => {
    await mount()
    await measure(100, 200)
    await measure(0, 0)
    await global.advanceUntilIdle()
    expect(values.width.get()).toBe(0)
    expect(values.height.get()).toBe(0)

    await measure(100, 200)
    await global.advanceByTime(50)
    expect(values.width.get()).toBeGreaterThan(0)
    expect(values.width.get()).toBeLessThan(100)
    expect(values.height.get()).toBeGreaterThan(0)
    expect(values.height.get()).toBeLessThan(200)
  })

  it('animates width changes while height remains zero', async () => {
    await mount()
    await measure(100, 0)
    await measure(200, 0)
    await global.advanceByTime(50)

    expect(values.width.get()).toBeGreaterThan(100)
    expect(values.width.get()).toBeLessThan(200)
    expect(values.height.get()).toBe(0)
  })

  it('continues to respect immediate updates', async () => {
    await mount(true)
    await measure(0, 0)
    await measure(100, 200)

    expect(values.width.get()).toBe(100)
    expect(values.height.get()).toBe(200)
    expect(values.width.idle).toBe(true)
    expect(values.height.idle).toBe(true)
  })
})
