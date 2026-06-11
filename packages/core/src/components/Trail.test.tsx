import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringValue } from '../SpringValue'
import { Trail } from './Trail'

describe('Trail', () => {
  it('renders one child per item, each with its own spring values', async () => {
    const seen: Record<number, any> = {}
    const { getByTestId } = await render(
      <Trail items={['a', 'b', 'c']} from={{ opacity: 0 }} to={{ opacity: 1 }}>
        {(item: unknown, index: number) => (values: any) => {
          seen[index] = values
          const id = String(item)
          return <div data-testid={`item-${id}`}>{id}</div>
        }}
      </Trail>
    )

    // One mounted element per item.
    expect(getByTestId('item-a').query()).toBeTruthy()
    expect(getByTestId('item-b').query()).toBeTruthy()
    expect(getByTestId('item-c').query()).toBeTruthy()

    // Each item gets a distinct SpringValue, not a shared reference.
    expect(seen[0].opacity).toBeInstanceOf(SpringValue)
    expect(seen[0].opacity).not.toBe(seen[1].opacity)
    expect(seen[1].opacity).not.toBe(seen[2].opacity)

    await global.advanceUntilIdle()
    expect(seen[2].opacity.get()).toBe(1)
  })

  it('skips items whose child returns a falsy value', async () => {
    const { getByTestId } = await render(
      <Trail items={['a', 'b']} to={{ opacity: 1 }}>
        {(item: unknown) =>
          item === 'b'
            ? false
            : () => <div data-testid={`item-${String(item)}`} />
        }
      </Trail>
    )

    expect(getByTestId('item-a').query()).toBeTruthy()
    expect(getByTestId('item-b').query()).toBeNull()
  })
})
