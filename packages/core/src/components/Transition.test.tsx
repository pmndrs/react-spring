import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringValue } from '../SpringValue'
import { Transition } from './Transition'

describe('Transition', () => {
  it('passes animated styles and the item to the render fn, animating on enter', async () => {
    let style: any
    await render(
      <Transition
        items={true}
        from={{ t: 0 }}
        enter={{ t: 1 }}
        leave={{ t: 0 }}
      >
        {(values, item) => {
          if (item) style = values
          return null
        }}
      </Transition>
    )

    expect(style.t).toBeInstanceOf(SpringValue)
    expect(style.t.get()).toBe(0)

    await global.advanceUntilIdle()
    expect(style.t.get()).toBe(1)
  })

  it('keeps a leaving item mounted until its leave animation finishes', async () => {
    const Comp = ({ show }: { show: boolean }) => (
      <Transition
        items={show ? ['x'] : []}
        keys={(item: string) => item}
        from={{ t: 0 }}
        enter={{ t: 1 }}
        leave={{ t: 0 }}
      >
        {(_values, item) => <div data-testid={`item-${item}`}>{item}</div>}
      </Transition>
    )

    const screen = await render(<Comp show={true} />)
    await global.advanceUntilIdle()
    expect(screen.getByTestId('item-x').query()).toBeTruthy()

    // Removing the item starts its leave animation but keeps it mounted.
    await screen.rerender(<Comp show={false} />)
    expect(screen.getByTestId('item-x').query()).toBeTruthy()

    // Once the leave animation settles, the item unmounts.
    await global.advanceUntilIdle()
    expect(screen.getByTestId('item-x').query()).toBeNull()
  })
})
