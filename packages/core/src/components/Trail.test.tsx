import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringValue } from '../SpringValue'
import { Trail as TrailComponent } from './Trail'

// `Trail` renders an array of nodes, which TypeScript <= 5.4 rejects as a JSX
// element type (TS2786). Cast to a plain component type for the test — we're
// exercising runtime behaviour, not Trail's JSX typing.
const Trail = TrailComponent as unknown as (
  props: any
) => React.ReactElement | null

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
