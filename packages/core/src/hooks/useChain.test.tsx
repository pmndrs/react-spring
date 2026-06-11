import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringRef } from '../SpringRef'
import { useSpring } from './useSpring'
import { useChain } from './useChain'

describe('useChain', () => {
  it('runs each ref in sequence when no timeSteps are given', async () => {
    const ref1 = SpringRef()
    const ref2 = SpringRef()
    let s1: any
    let s2: any

    const Comp = () => {
      s1 = useSpring({ ref: ref1, from: { x: 0 }, to: { x: 100 } })
      s2 = useSpring({ ref: ref2, from: { y: 0 }, to: { y: 100 } })
      useChain([ref1, ref2])
      return null
    }

    await render(<Comp />)

    // The first ref animates immediately...
    await global.advance(3)
    expect(s1.x.get()).toBeGreaterThan(0)
    // ...while the second is gated behind it and hasn't moved.
    expect(s2.y.get()).toBe(0)

    // Driving to the end shows the second ref does eventually run.
    await global.advanceUntilValue(s2.y, 100)
    expect(s2.y.get()).toBeCloseTo(100, 0)
  })

  it('delays each ref by timeFrame * timeSteps[i]', async () => {
    const ref1 = SpringRef()
    const ref2 = SpringRef()
    let s2: any

    const Comp = () => {
      useSpring({ ref: ref1, from: { x: 0 }, to: { x: 100 } })
      s2 = useSpring({ ref: ref2, from: { y: 0 }, to: { y: 100 } })
      // ref2 is delayed by 1000 * 0.5 = 500ms.
      useChain([ref1, ref2], [0, 0.5], 1000)
      return null
    }

    await render(<Comp />)

    // Before the delay elapses, the second ref stays at its start value.
    await global.advance(3)
    expect(s2.y.get()).toBe(0)

    // Once the 500ms delay fires, it begins animating.
    await global.advanceByTime(500)
    await global.advance(10)
    expect(s2.y.get()).toBeGreaterThan(0)
  })
})
