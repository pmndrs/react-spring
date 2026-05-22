import * as React from 'react'
import { render } from 'vitest-browser-react'
import { type ISpringContext, SpringContextProvider } from './SpringContext'
import { SpringValue } from './SpringValue'
import { useSpring } from './hooks'

describe('SpringContext', () => {
  let t: SpringValue<number>

  const Child = () => {
    t = useSpring({ t: 1, from: { t: 0 } }).t
    return null
  }

  const update = createUpdater(props => (
    <SpringContextProvider {...props}>
      <Child />
    </SpringContextProvider>
  ))

  it('only merges when changed', async () => {
    const context: ISpringContext = {}
    const onProps = vi.fn()
    const Test = () => {
      useSpring({ onProps, x: 0 })
      return null
    }

    const getRoot = () => (
      <SpringContextProvider {...context}>
        <Test />
      </SpringContextProvider>
    )

    const expectUpdates = (updates: any[]) => {
      onProps.mock.calls.forEach((args, i) => {
        const update = updates[i]
        if (update) {
          expect(args[0]).toMatchObject(update)
        } else {
          // Unexpected update.
          expect(args[0]).toBeUndefined()
        }
      })
      onProps.mockClear()
    }

    const elem = await render(getRoot())
    // React.StrictMode runs the layout effect twice on initial mount
    // (mount → simulated unmount → remount). Both passes apply the
    // user update, and the second pass also re-broadcasts the default-
    // context update — because `defaultProps.onProps` was set by the
    // first pass's user update, so the otherwise-quiet default merge
    // now reaches the spy. Subsequent rerenders are not affected.
    expectUpdates([
      { onProps, to: { x: 0 } },
      { default: { pause: false, immediate: false } },
      { onProps, to: { x: 0 } },
    ])

    context.pause = true
    await elem.rerender(getRoot())
    expectUpdates([{ default: context }, { onProps, to: { x: 0 } }])

    await elem.rerender(getRoot())
    expectUpdates([{ onProps, to: { x: 0 } }])
  })

  it('can pause current animations', async () => {
    await update({})
    global.mockRaf.step()
    expect(t.idle).toBeFalsy()

    await update({ pause: true })
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBe(1)

    await update({ pause: false })
    expect(t.idle).toBeFalsy()
    expect(t.goal).toBe(1)
  })
  it('can pause future animations', async () => {
    // Paused right away.
    await update({ pause: true })
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBeUndefined()

    // This update is paused too.
    t.start(2)
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBeUndefined()

    // Let it roll.
    await update({ pause: false })
    expect(t.idle).toBeFalsy()
    // The `goal` is not 2, because the `useSpring` hook is
    // executed by the SpringContext update.
    expect(t.goal).toBe(1)
  })

  it('can make current animations immediate', async () => {
    await update({})
    global.mockRaf.step()
    expect(t.idle).toBeFalsy()

    await update({ immediate: true })
    global.mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(1)
  })
  it('can make future animations immediate', async () => {
    await update({ immediate: true })
    global.mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(1)

    t.start(2)
    global.mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(2)
  })
})

function createUpdater(Component: React.ComponentType<ISpringContext>) {
  let result: Awaited<ReturnType<typeof render>> | undefined
  afterEach(() => {
    result = undefined
  })
  return async (props: ISpringContext) => {
    const elem = <Component {...props} />
    if (result) await result.rerender(elem)
    else result = await render(elem)
    return result
  }
}
