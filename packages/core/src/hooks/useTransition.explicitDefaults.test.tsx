import * as React from 'react'
import { render } from 'vitest-browser-react'
import { toArray } from '@react-spring/shared'
import { useTransition } from './useTransition'
import { SpringRef } from '../SpringRef'
import type { UseTransitionProps } from '../types'

describe.each([false, true])(
  'useTransition explicit defaults, factory=%s',
  factory => {
    const useTransitionCase = factory
      ? useFactoryTransition
      : useObjectTransition
    it.each([
      ['implicit', undefined, true],
      ['false', false, true],
      ['empty object', {}, false],
    ] as const)(
      '%s follows object-form event extraction',
      async (_, defaults, fires) => {
        const onRest = vi.fn()
        function Component() {
          const transition = useTransitionCase({
            from: { x: 0 },
            enter: { x: 1 },
            default: defaults,
            onRest,
          })
          transition(() => null)
          return null
        }
        await render(<Component />)
        await global.advanceUntilIdle()
        expect(onRest).toBeCalledTimes(fires ? 1 : 0)
      }
    )

    it('forwards explicit default callbacks instead of top-level callbacks', async () => {
      const topLevel = vi.fn()
      const inherited = vi.fn()
      function Component() {
        const transition = useTransitionCase({
          from: { x: 0 },
          enter: { x: 1 },
          default: { onRest: inherited },
          onRest: topLevel,
        })
        transition(() => null)
        return null
      }
      await render(<Component />)
      await global.advanceUntilIdle()
      expect(inherited).toBeCalledTimes(1)
      expect(topLevel).not.toBeCalled()
    })

    it.each([
      ['inherited', undefined, undefined, 123],
      ['top-level', { duration: 234 }, undefined, 234],
      ['phase', { duration: 234 }, { duration: 345 }, 345],
    ] as const)(
      '%s config keeps existing precedence',
      async (_, config, phaseConfig, expected) => {
        const ref = SpringRef()
        function Component() {
          const transition = useTransitionCase({
            ref,
            from: { x: 0 },
            enter: { x: 1, ...(phaseConfig ? { config: phaseConfig } : {}) },
            default: { config: { duration: 123 } },
            ...(config ? { config } : {}),
          })
          transition(() => null)
          return null
        }
        await render(<Component />)
        ref.start()
        await global.advanceUntilIdle()
        expect(ref.current[0].springs.x.animation.config.duration).toBe(
          expected
        )
        expect(ref.current[0].get().x).toBe(1)
      }
    )

    it('makes onProps, onPause and onResume available to a factory transition', async () => {
      const ref = SpringRef()
      const onProps = vi.fn()
      const onPause = vi.fn()
      const onResume = vi.fn()
      function Component() {
        const transition = useTransitionCase({
          ref,
          from: { x: 0 },
          enter: { x: 1 },
          onProps,
          onPause,
          onResume,
        })
        transition(() => null)
        return null
      }
      await render(<Component />)
      ref.start()
      expect(onProps).toBeCalled()
      ref.pause()
      expect(onPause).toBeCalledTimes(1)
      ref.resume()
      expect(onResume).toBeCalledTimes(1)
      await global.advanceUntilIdle()
      expect(ref.current[0].get().x).toBe(1)
    })
  }
)

function useFactoryTransition(props: UseTransitionProps) {
  return toArray(useTransition(true, () => props))[0]
}

function useObjectTransition(props: UseTransitionProps) {
  return toArray(useTransition(true, props))[0]
}
