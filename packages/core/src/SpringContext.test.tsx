import * as React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { SpringContext } from './SpringContext'
import { SpringValue } from './SpringValue'
import { useSpring } from './hooks'

describe('SpringContext', () => {
  let t: SpringValue<number>

  const Child = () => {
    t = useSpring({ t: 1, from: { t: 0 } }).t
    return null
  }

  const update = createUpdater(props => (
    <SpringContext {...props}>
      <Child />
    </SpringContext>
  ))

  it('only merges when changed', () => {
    const context: SpringContext = {}
    const onProps = jest.fn()
    const Test = () => {
      useSpring({ onProps, x: 0 })
      return null
    }

    const getRoot = () => (
      <SpringContext {...context}>
        <Test />
      </SpringContext>
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

    const elem = render(getRoot())
    expectUpdates([{ onProps, to: { x: 0 } }])

    context.pause = true
    elem.rerender(getRoot())
    expectUpdates([{ default: context }, { onProps, to: { x: 0 } }])

    elem.rerender(getRoot())
    expectUpdates([{ onProps, to: { x: 0 } }])
  })

  it('can pause current animations', () => {
    update({})
    global.mockRaf.step()
    expect(t.idle).toBeFalsy()

    update({ pause: true })
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBe(1)

    update({ pause: false })
    expect(t.idle).toBeFalsy()
    expect(t.goal).toBe(1)
  })
  it('can pause future animations', () => {
    // Paused right away.
    update({ pause: true })
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBeUndefined()

    // This update is paused too.
    t.start(2)
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBeUndefined()

    // Let it roll.
    update({ pause: false })
    expect(t.idle).toBeFalsy()
    // The `goal` is not 2, because the `useSpring` hook is
    // executed by the SpringContext update.
    expect(t.goal).toBe(1)
  })

  it('can make current animations immediate', () => {
    update({})
    global.mockRaf.step()
    expect(t.idle).toBeFalsy()

    update({ immediate: true })
    global.mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(1)
  })
  it('can make future animations immediate', () => {
    update({ immediate: true })
    global.mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(1)

    t.start(2)
    global.mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(2)
  })
})

function createUpdater(Component: React.ComponentType<SpringContext>) {
  let result: RenderResult | undefined
  afterEach(() => {
    result = undefined
  })
  return (props: SpringContext) => {
    const elem = <Component {...props} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
