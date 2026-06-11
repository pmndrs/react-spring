import * as React from 'react'
import { render } from 'vitest-browser-react'
import { __raf } from '@react-spring/rafz'

import { SpringValue } from '../SpringValue'
import { useScroll } from './useScroll'

// `useScroll` polls the container's scroll position on every rAF tick (see
// `onScroll` in @react-spring/shared), so it is fully drivable with mock-raf —
// no real scroll-event timing required.
describe('useScroll', () => {
  const renderScroll = async () => {
    let values: any
    const Comp = () => {
      const ref = React.useRef<HTMLDivElement>(null)
      values = useScroll({ container: ref as any })
      return (
        <div
          ref={ref}
          style={{ height: 100, overflow: 'auto' }}
          data-testid="container"
        >
          <div style={{ height: 1000 }} />
        </div>
      )
    }
    const screen = await render(<Comp />)
    return { screen, get: () => values }
  }

  it('returns scroll spring values initialised to 0', async () => {
    const { get } = await renderScroll()
    const values = get()
    for (const key of [
      'scrollX',
      'scrollY',
      'scrollXProgress',
      'scrollYProgress',
    ]) {
      expect(values[key]).toBeInstanceOf(SpringValue)
      expect(values[key].get()).toBe(0)
    }
  })

  it('tracks the container scroll position and progress', async () => {
    const { screen, get } = await renderScroll()
    const container = screen.getByTestId('container').element() as HTMLElement

    // scrollLength = scrollHeight (1000) - clientHeight (100) = 900
    container.scrollTop = 450
    await global.advance(200)

    expect(get().scrollY.get()).toBeCloseTo(450, 0)
    expect(get().scrollYProgress.get()).toBeCloseTo(0.5, 1)
  })

  it('cancels its per-frame scroll loop on unmount', async () => {
    const { screen } = await renderScroll()
    await global.advance(2)

    // The poll keeps a pending rAF task alive every frame while mounted.
    expect(__raf.count()).toBeGreaterThan(0)

    screen.unmount()

    // If cleanup failed, the poll re-queues itself every frame and this never
    // settles (advanceUntilIdle throws at its frame cap). Draining to idle is
    // the proof the loop was cancelled.
    await global.advanceUntilIdle()
    expect(__raf.count()).toBe(0)
  })
})
