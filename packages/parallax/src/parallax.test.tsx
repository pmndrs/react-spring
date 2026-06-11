import * as React from 'react'
import { render } from 'vitest-browser-react'

import { Parallax, ParallaxLayer, IParallax } from './index'

// Parallax derives everything from the container's clientHeight, so each test
// renders inside a positioned, fixed-size wrapper to pin `space` deterministically.
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'relative', width: 400, height: 500 }}>
    {children}
  </div>
)

describe('Parallax', () => {
  it('exposes the documented IParallax imperative handle', async () => {
    const ref = React.createRef<IParallax>()
    await render(
      <Wrapper>
        <Parallax pages={3} ref={ref}>
          <ParallaxLayer offset={0} />
        </Parallax>
      </Wrapper>
    )

    const api = ref.current!
    expect(typeof api.scrollTo).toBe('function')
    expect(typeof api.update).toBe('function')
    expect(typeof api.stop).toBe('function')
    expect(api.layers).toBeInstanceOf(Set)
    expect(api.controller).toBeTruthy()
    expect(api.container.current).toBeTruthy()
    expect(api.content.current).toBeTruthy()
    expect(api.horizontal).toBe(false)
  })

  it('scrollTo() animates the container to the given page offset', async () => {
    const ref = React.createRef<IParallax>()
    const { getByTestId } = await render(
      <Wrapper>
        <Parallax pages={3} ref={ref} data-testid="container">
          <ParallaxLayer offset={0} />
        </Parallax>
      </Wrapper>
    )
    const container = getByTestId('container').element() as HTMLElement

    // space == clientHeight == 500, so page 1 sits at scrollTop 500.
    expect(ref.current!.space).toBe(500)
    ref.current!.scrollTo(1)
    await global.advanceUntilIdle()

    expect(container.scrollTop).toBeCloseTo(500, 0)
  })

  it('sizes a layer by its `factor`', async () => {
    const { getByTestId } = await render(
      <Wrapper>
        <Parallax pages={3}>
          <ParallaxLayer offset={0} factor={2} data-testid="layer" />
        </Parallax>
      </Wrapper>
    )

    // A frame applies the immediate setHeight(space * factor) from update().
    await global.advance(2)

    const layer = getByTestId('layer').element() as HTMLElement
    // space (500) * factor (2) = 1000px tall.
    expect(layer.style.height).toBe('1000px')
  })
})
