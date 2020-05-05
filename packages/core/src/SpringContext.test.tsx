import React from 'react'
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

  it('can cancel current animations', () => {
    update({})
    mockRaf.step()
    expect(t.idle).toBeFalsy()
    update({ cancel: true })
    expect(t.idle).toBeTruthy()
  })
  it('can cancel future animations', async () => {
    update({ cancel: true })
    expect(t.idle).toBeTruthy()
    const { cancelled } = await t.start(100)
    expect(cancelled).toBeTruthy()
    expect(t.idle).toBeTruthy()
    expect(t.goal).toBe(0)
  })

  it('can pause current animations', () => {
    update({})
    mockRaf.step()
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
    mockRaf.step()
    expect(t.idle).toBeFalsy()

    update({ immediate: true })
    mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(1)
  })
  it('can make future animations immediate', () => {
    update({ immediate: true })
    mockRaf.step()

    expect(t.idle).toBeTruthy()
    expect(t.get()).toBe(1)

    t.start(2)
    mockRaf.step()

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
