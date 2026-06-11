import * as React from 'react'
import { render } from 'vitest-browser-react'

import { SpringValue } from '../SpringValue'
import { Spring } from './Spring'

describe('Spring', () => {
  it('calls its children with the spring values and mounts the result', async () => {
    let values: any
    const { getByTestId } = await render(
      <Spring from={{ x: 0 }} to={{ x: 100 }}>
        {styles => {
          values = styles
          return <div data-testid="box" />
        }}
      </Spring>
    )

    // The element returned by the render fn is mounted...
    expect(getByTestId('box').query()).toBeTruthy()
    // ...and it receives live SpringValues keyed by the animated props.
    expect(values.x).toBeInstanceOf(SpringValue)
    expect(values.x.get()).toBe(0)

    await global.advanceUntilIdle()
    expect(values.x.get()).toBe(100)
  })

  it('forwards config to the underlying animation', async () => {
    let values: any
    await render(
      <Spring to={{ x: 1 }} config={{ tension: 123 }}>
        {styles => {
          values = styles
          return null
        }}
      </Spring>
    )

    expect(values.x.animation.config.tension).toBe(123)
  })

  it('applies the `immediate` prop so the value jumps to its goal', async () => {
    let values: any
    await render(
      <Spring from={{ x: 0 }} to={{ x: 100 }} immediate>
        {styles => {
          values = styles
          return null
        }}
      </Spring>
    )

    global.mockRaf.step()
    expect(values.x.get()).toBe(100)
  })
})
