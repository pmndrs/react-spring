import * as React from 'react'
import { render } from 'vitest-browser-react'
import { toArray } from '@react-spring/shared'
import { useTransition } from './useTransition'
import { SpringRef } from '../SpringRef'

// https://github.com/pmndrs/react-spring/issues/2048
// Hook-level events must reach each transition, including when props is a factory.
describe('useTransition factory defaults', () => {
  it.each([
    ['object', false, false, false],
    ['object with deps', false, true, false],
    ['factory', true, false, false],
    ['factory with deps', true, true, false],
    ['object with injected ref', false, false, true],
    ['factory with injected ref', true, false, true],
  ] as const)(
    '%s forwards lifecycle events',
    async (_, factory, deps, injected) => {
      const onStart = vi.fn()
      const onChange = vi.fn()
      const onRest = vi.fn()
      const ref = SpringRef()
      function Component() {
        const p = {
          from: { x: 0 },
          enter: { x: 1 },
          onStart,
          onChange,
          onRest,
          ...(injected ? { ref } : {}),
        }
        const props = factory ? () => p : p
        const result = deps
          ? useTransition(true, props as any, [])
          : useTransition(true, props as any)
        const transition = toArray(result)[0]
        transition(() => null)
        return null
      }
      await render(<Component />)
      if (injected) {
        await global.advanceUntilIdle()
        expect(ref.current[0].get().x).toBe(0)
        expect(onStart).not.toBeCalled()
        ref.start()
      }
      await global.advanceUntilIdle()
      expect(onChange.mock.lastCall?.[0].value.x).toBe(1)
      expect(onStart).toBeCalledTimes(1)
      expect(onChange).toBeCalled()
      expect(onRest).toBeCalledTimes(1)
      expect(onStart.mock.calls[0][2]).toBe(true)
    }
  )

  it('keeps phase-specific handlers ahead of factory defaults', async () => {
    const defaultOnRest = vi.fn()
    const phaseOnRest = vi.fn()
    function Component() {
      const transition = toArray(
        useTransition(true, () => ({
          from: { x: 0 },
          enter: { x: 1, onRest: phaseOnRest },
          onRest: defaultOnRest,
        }))
      )[0]
      transition(() => null)
      return null
    }
    await render(<Component />)
    await global.advanceUntilIdle()
    expect(phaseOnRest).toBeCalledTimes(1)
    expect(defaultOnRest).not.toBeCalled()
  })
})
