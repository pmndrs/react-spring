import * as React from 'react'
import { useRef } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { Parallax, ParallaxLayer, type IParallax } from '@react-spring/parallax'

const WIDTH = 1200
const HEIGHT = 600

interface DemoProps {
  horizontal?: boolean
}

function BaseDemo({ horizontal = false }: DemoProps) {
  const parallax = useRef<IParallax>(null)

  const scroll = (to: number) => {
    parallax.current?.scrollTo(to)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
      }}
    >
      <Parallax
        ref={parallax}
        pages={3}
        horizontal={horizontal}
        data-testid="container"
      >
        <ParallaxLayer
          horizontal={!horizontal}
          offset={1}
          speed={1}
          data-testid="opposite-layer"
        />
        <ParallaxLayer offset={1} speed={1} data-testid="default-layer" />
        <ParallaxLayer sticky={{ start: 1, end: 2 }} data-testid="sticky-layer">
          <div>Sticky</div>
        </ParallaxLayer>
        <ParallaxLayer>
          <button onClick={() => scroll(1)}>Scroll</button>
        </ParallaxLayer>
      </Parallax>
    </div>
  )
}

// Sticky layer wrapped in a component rather than passed as a direct child of
// Parallax — the scenario reported in #2052.
function WrappedSticky() {
  return (
    <ParallaxLayer sticky={{ start: 1, end: 2 }} data-testid="sticky-layer">
      <div>Sticky</div>
    </ParallaxLayer>
  )
}

function WrappedStickyDemo() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
      }}
    >
      <Parallax pages={3} data-testid="container">
        <ParallaxLayer offset={1} speed={1} data-testid="default-layer" />
        <WrappedSticky />
      </Parallax>
    </div>
  )
}

function transformOf(testId: string): string {
  const el = page.getByTestId(testId).element() as HTMLElement
  return el.style.transform
}

function positionOf(testId: string): string {
  const el = page.getByTestId(testId).element() as HTMLElement
  return window.getComputedStyle(el).position
}

async function waitForTransform(testId: string, expected: string) {
  await expect.poll(() => transformOf(testId), { timeout: 8000 }).toBe(expected)
}

async function scrollContainerToBottom() {
  const el = page.getByTestId('container').element() as HTMLElement
  el.scrollTo(0, el.scrollHeight)
}

async function scrollContainerToRight() {
  const el = page.getByTestId('container').element() as HTMLElement
  el.scrollTo(el.scrollWidth, 0)
}

async function scrollContainer(x: number, y: number) {
  const el = page.getByTestId('container').element() as HTMLElement
  el.scrollTo(x, y)
}

describe('Parallax - vertical', () => {
  beforeEach(async () => {
    await page.viewport(WIDTH, HEIGHT)
    render(<BaseDemo />)
  })

  it('should translate layers as expected', async () => {
    // initial layer positions
    expect(transformOf('default-layer')).toBe(
      `translate3d(0px, ${HEIGHT * 2}px, 0px)`
    )
    expect(transformOf('opposite-layer')).toBe(
      `translate3d(${HEIGHT * 2}px, 0px, 0px)`
    )
    expect(positionOf('sticky-layer')).toBe('absolute')
    expect(transformOf('sticky-layer')).toBe(
      `translate3d(0px, ${HEIGHT}px, 0px)`
    )

    // scroll to next page and wait for the animation
    await scrollContainer(0, HEIGHT)
    await waitForTransform(
      'default-layer',
      `translate3d(0px, ${HEIGHT}px, 0px)`
    )

    expect(transformOf('opposite-layer')).toBe(
      `translate3d(${HEIGHT}px, 0px, 0px)`
    )
    expect(positionOf('sticky-layer')).toBe('sticky')
    expect(transformOf('sticky-layer')).toBe('translate3d(0px, 0px, 0px)')

    // scroll to last page
    await scrollContainerToBottom()
    await waitForTransform('default-layer', 'translate3d(0px, 0px, 0px)')

    expect(transformOf('opposite-layer')).toBe('translate3d(0px, 0px, 0px)')
    expect(transformOf('sticky-layer')).toBe('translate3d(0px, 0px, 0px)')
    expect(positionOf('sticky-layer')).toBe('sticky')
  })

  it('should scroll to the correct page with scrollTo', async () => {
    const container = page.getByTestId('container').element() as HTMLElement
    await page.getByRole('button').click()
    // Page-sized scroll — within 1% to tolerate sub-pixel rounding between
    // Parallax's internal page measurement and the container's clientHeight.
    await expect
      .poll(() => container.scrollTop)
      .toBeGreaterThan(container.clientHeight * 0.99)
  })
})

describe('Parallax - sticky layer wrapped in a component (#2052)', () => {
  beforeEach(async () => {
    await page.viewport(WIDTH, HEIGHT)
    render(<WrappedStickyDemo />)
  })

  // Skipped: documents a known, unfixed limitation. Parallax decides DOM
  // placement by reading `child.props.sticky` while walking its children with
  // React.Children.map, which traverses the static element tree and never
  // renders components — so a wrapped layer's `sticky` prop is invisible and it
  // lands inside the scrolling content, scrolling away between start and end.
  // A real fix moves the placement decision into the layer (e.g. createPortal).
  // Unskip when #2052 is fixed.
  it.skip('keeps the sticky layer a direct child of the container, not the scrolling content', async () => {
    const sticky = page.getByTestId('sticky-layer').element() as HTMLElement
    // A sticky layer must render as a sibling of the scrolling content div
    // (i.e. a direct child of the container), otherwise it scrolls away and
    // vanishes between its start and end offsets.
    expect(sticky.parentElement?.dataset.testid).toBe('container')
  })
})

describe('Parallax - horizontal', () => {
  beforeEach(async () => {
    await page.viewport(WIDTH, HEIGHT)
    render(<BaseDemo horizontal />)
  })

  it('should translate layers as expected', async () => {
    expect(transformOf('default-layer')).toBe(
      `translate3d(${WIDTH * 2}px, 0px, 0px)`
    )
    expect(transformOf('opposite-layer')).toBe(
      `translate3d(0px, ${WIDTH * 2}px, 0px)`
    )
    expect(positionOf('sticky-layer')).toBe('absolute')
    expect(transformOf('sticky-layer')).toBe(
      `translate3d(${WIDTH}px, 0px, 0px)`
    )

    await scrollContainer(WIDTH, 0)
    await waitForTransform('default-layer', `translate3d(${WIDTH}px, 0px, 0px)`)

    expect(transformOf('opposite-layer')).toBe(
      `translate3d(0px, ${WIDTH}px, 0px)`
    )
    expect(positionOf('sticky-layer')).toBe('sticky')
    expect(transformOf('sticky-layer')).toBe('translate3d(0px, 0px, 0px)')

    await scrollContainerToRight()
    await waitForTransform('default-layer', 'translate3d(0px, 0px, 0px)')

    expect(transformOf('opposite-layer')).toBe('translate3d(0px, 0px, 0px)')
    expect(transformOf('sticky-layer')).toBe('translate3d(0px, 0px, 0px)')
    expect(positionOf('sticky-layer')).toBe('sticky')
  })

  it('should scroll to the correct page with scrollTo', async () => {
    const container = page.getByTestId('container').element() as HTMLElement
    await page.getByRole('button').click()
    // Page-sized scroll — within 1% to tolerate sub-pixel rounding between
    // Parallax's internal page measurement and the container's clientWidth.
    await expect
      .poll(() => container.scrollLeft)
      .toBeGreaterThan(container.clientWidth * 0.99)
  })
})
