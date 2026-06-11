import * as React from 'react'
import { render } from 'vitest-browser-react'

import { useSprings } from './useSprings'
import { useTrail } from './useTrail'
import { useTransition } from './useTransition'

type Handlers = {
  onStart: ReturnType<typeof vi.fn>
  onChange: ReturnType<typeof vi.fn>
  onRest: ReturnType<typeof vi.fn>
}

// onStart/onChange/onRest are exhaustively tested on SpringValue and Controller.
// The risk these tests guard is the *passthrough* path: the multi-spring hooks
// diff and forward props, and that is where lifecycle callbacks have historically
// been dropped (see #2532, #2410).
const cases: { name: string; Comp: React.FC<{ handlers: Handlers }> }[] = [
  {
    name: 'useSprings',
    Comp: ({ handlers }) => {
      // `vi.fn()`'s Mock type isn't assignable to the event-handler params in
      // the array overload on TS <= 5.4, so cast — the object-form hooks below
      // accept it fine.
      const props = { from: { x: 0 }, to: { x: 1 }, ...handlers }
      useSprings(2, [props, props] as any)
      return null
    },
  },
  {
    name: 'useTrail',
    Comp: ({ handlers }) => {
      useTrail(2, { from: { x: 0 }, to: { x: 1 }, ...handlers })
      return null
    },
  },
  {
    name: 'useTransition',
    Comp: ({ handlers }) => {
      const transition = useTransition(true, {
        from: { x: 0 },
        enter: { x: 1 },
        ...handlers,
      })
      transition(() => null)
      return null
    },
  },
]

describe.each(cases)('$name lifecycle events', ({ Comp }) => {
  it('forwards onStart, onChange and onRest to the animation', async () => {
    const handlers: Handlers = {
      onStart: vi.fn(),
      onChange: vi.fn(),
      onRest: vi.fn(),
    }

    await render(<Comp handlers={handlers} />)
    await global.advanceUntilIdle()

    expect(handlers.onStart).toHaveBeenCalled()
    expect(handlers.onChange).toHaveBeenCalled()
    expect(handlers.onRest).toHaveBeenCalled()
  })
})
