import * as React from 'react'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { animated, useResize } from '../../targets/web/src'

it('animates a ResizeObserver container when expanding from zero', async () => {
  const heights: number[] = []
  let size: ReturnType<typeof useResize>

  function Component() {
    const container = React.useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = React.useState(false)
    size = useResize({
      container,
      config: { duration: 200 },
      onChange: result => heights.push(result.value.height),
    })
    return (
      <>
        <button onClick={() => setExpanded(value => !value)}>Toggle</button>
        <animated.div style={{ height: size.height, overflow: 'hidden' }}>
          <div
            ref={container}
            style={{ width: 100, height: expanded ? 100 : 0 }}
          />
        </animated.div>
      </>
    )
  }

  const screen = await render(<Component />)
  // Wait for the first real observation, including its zero height.
  await expect.poll(() => size.width.get()).toBe(100)
  expect(size!.height.get()).toBe(0)

  for (let expansion = 0; expansion < 2; expansion++) {
    heights.length = 0
    await screen.getByRole('button', { name: 'Toggle' }).click()
    await expect.poll(() => size.height.get()).toBe(100)
    expect(heights.some(height => height > 0 && height < 100)).toBe(true)

    await screen.getByRole('button', { name: 'Toggle' }).click()
    await expect.poll(() => size.height.get()).toBe(0)
  }
})
