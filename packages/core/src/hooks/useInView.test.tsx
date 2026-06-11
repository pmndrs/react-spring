import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringValue } from '../SpringValue'
import { useInView } from './useInView'

// `useInView` reacts to `IntersectionObserver`, whose callbacks fire on the
// browser's own schedule and so aren't deterministically drivable here. These
// tests cover the deterministic public contract: the returned shape for both
// call signatures and the SSR/old-browser guard when IntersectionObserver is
// unavailable.
describe('useInView', () => {
  it('returns a ref and a boolean that starts false', async () => {
    let result: any
    const Comp = () => {
      result = useInView()
      const [ref] = result
      return <div ref={ref} />
    }
    await render(<Comp />)

    expect(typeof result[0]).toBe('object') // a React ref object
    expect(result[1]).toBe(false)
  })

  it('returns spring values when called with a props function', async () => {
    let result: any
    const Comp = () => {
      result = useInView(() => ({ from: { opacity: 0 }, to: { opacity: 1 } }))
      const [ref] = result
      return <div ref={ref} />
    }
    await render(<Comp />)

    expect(result[1].opacity).toBeInstanceOf(SpringValue)
    expect(result[1].opacity.get()).toBe(0)
  })

  it('does not throw and stays out of view when IntersectionObserver is unavailable', async () => {
    const original = globalThis.IntersectionObserver
    // Simulate an SSR / old-browser environment.
    // @ts-expect-error - deliberately removing the global
    delete globalThis.IntersectionObserver

    try {
      let result: any
      const Comp = () => {
        result = useInView()
        const [ref] = result
        return <div ref={ref} />
      }
      await render(<Comp />)
      expect(result[1]).toBe(false)
    } finally {
      globalThis.IntersectionObserver = original
    }
  })
})
