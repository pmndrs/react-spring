import * as React from 'react'
import { render } from 'vitest-browser-react'
import { is } from '@react-spring/shared'
import { Presence, UsePresenceProps } from '../types'
import { usePresence } from './usePresence'
import type { SpringRef } from '../SpringRef'
import type { SpringValue } from '../SpringValue'
import { renderWithFastRefresh } from '../../test/fastRefresh'

type Props = UsePresenceProps | (() => UsePresenceProps)

describe('usePresence', () => {
  let presence: Presence | null
  let api: SpringRef | undefined

  afterEach(() => {
    result = undefined
  })

  const update = createUpdater(({ args }) => {
    const value: any = usePresence(...(args as [boolean, any]))
    const isTuple = is.fun(args[1]) || args.length == 3
    presence = isTuple ? value[0] : value
    api = isTuple ? value[1] : undefined
    return null
  })

  const props = {
    from: { n: 0 },
    enter: { n: 1 },
    leave: { n: 0 },
  }

  it('returns null while hidden', async () => {
    await update(false, props)
    expect(presence).toBeNull()
  })

  it('enters from the "from" values', async () => {
    await update(false, props)
    await update(true, props)
    expect(presence!.phase).toBe('enter')
    expect(presence!.springs.n.get()).toBe(0)

    await global.advanceUntilIdle()
    expect(presence!.springs.n.get()).toBe(1)
  })

  it('returns null once the leave animation has finished', async () => {
    await update(true, props)
    await global.advanceUntilIdle()

    await update(false, props)
    expect(presence!.phase).toBe('leave')
    const { n } = presence!.springs
    await global.advanceUntil(() => n.get() < 0.5)
    expect(presence!.phase).toBe('leave')

    await global.advanceUntilIdle()
    expect(presence).toBeNull()
  })

  it('returns null straight away without "leave"', async () => {
    const noLeave = { from: { n: 0 }, enter: { n: 1 } }
    await update(true, noLeave)
    await update(false, noLeave)
    expect(presence).toBeNull()
  })

  it('reverses when shown again while leaving, without a remount', async () => {
    await update(true, props)
    await global.advanceUntilIdle()
    const { n } = presence!.springs

    await update(false, props)
    await global.advanceUntil(() => n.get() < 0.5)

    await update(true, props)
    expect(presence!.phase).toBe('enter')
    expect(presence!.springs.n).toBe(n)

    await global.advanceUntilIdle()
    expect(presence).not.toBeNull()
    expect(presence!.phase).toBe('enter')
    expect(presence!.springs.n).toBe(n)
  })

  it('calls phase functions', async () => {
    await update(true, {
      from: () => ({ n: 0 }),
      enter: () => ({ n: 1 }),
    })
    await global.advanceUntilIdle()
    expect(presence!.springs.n.get()).toBe(1)
  })

  it('returns a ref if the props argument is a function', async () => {
    await update(true, () => props)
    expect(presence!.phase).toBe('enter')
    expect(api).toHaveProperty('start')

    // The local ref does not defer the animation (#2287).
    await global.advanceUntilIdle()
    expect(presence!.springs.n.get()).toBe(1)
  })

  it('returns a ref if a deps argument is passed', async () => {
    await update(true, props, [])
    expect(presence!.phase).toBe('enter')
    expect(api).toHaveProperty('start')
  })

  // Regression test for https://github.com/pmndrs/react-spring/issues/2678
  it('finishes its enter animation after a Fast Refresh edit', async () => {
    let n!: SpringValue<number>
    const { edit } = await renderWithFastRefresh(
      () =>
        function Component() {
          n = usePresence(true, { ...props, config: { duration: 100 } })!
            .springs.n
          return null
        }
    )
    await global.advanceUntil(() => n.get() > 0.5)

    edit()
    await global.advanceUntilIdle()

    expect(n.get()).toBe(1)
  })

  it('stops animating when the component unmounts', async () => {
    let n!: SpringValue<number>
    function Component() {
      n = usePresence(true, { ...props, config: { duration: 100 } })!.springs.n
      return null
    }
    const view = await render(<Component />)
    await global.advanceUntil(() => n.get() > 0.5)

    await view.unmount()
    const valueAtUnmount = n.get()
    await global.advance()

    expect(n.idle).toBe(true)
    expect(n.get()).toBe(valueAtUnmount)
  })
})

let result: Awaited<ReturnType<typeof render>> | undefined
function createUpdater(
  Component: React.ComponentType<{ args: [boolean, Props, any[]?] }>
) {
  return async (...args: [boolean, any, any[]?]) => {
    const elem = <Component args={args} />
    if (result) await result.rerender(elem)
    else result = await render(elem)
    return result
  }
}
