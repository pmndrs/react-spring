import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringValue } from '../SpringValue'
import { useResize } from './useResize'

// `useResize` reports size via `ResizeObserver`, whose callbacks fire on the
// browser's own schedule (real timers) and so cannot be driven deterministically
// alongside mock-raf spring stepping. These tests therefore lock the public
// contract that is deterministic: the returned shape and clean teardown.
describe('useResize', () => {
  it('returns width and height spring values initialised to 0', async () => {
    let values: any
    const Comp = () => {
      values = useResize({})
      return null
    }
    await render(<Comp />)

    expect(values.width).toBeInstanceOf(SpringValue)
    expect(values.height).toBeInstanceOf(SpringValue)
    expect(values.width.get()).toBe(0)
    expect(values.height.get()).toBe(0)
  })

  it('stops its springs on unmount', async () => {
    let values: any
    const Comp = () => {
      values = useResize({})
      return null
    }
    const screen = await render(<Comp />)

    // Unmount runs the cleanup, which stops every spring it owns.
    screen.unmount()
    expect(values.width.idle).toBe(true)
    expect(values.height.idle).toBe(true)
  })
})
