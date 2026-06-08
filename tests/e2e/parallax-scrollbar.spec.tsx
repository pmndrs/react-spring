import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { Parallax, ParallaxLayer } from '@react-spring/parallax'

const WIDTH = 1200
const HEIGHT = 600

// Regression for #2255 "Parallax has double/inner scrollbar".
//
// The Parallax container is `position: absolute`. Before the fix it set no
// top/left, so it inherited its *static position*. When an ancestor offsets
// that static position — e.g. the `place-items: center` in Vite's default
// index.css, which the reporter kept when pasting the sandbox App "one to one"
// — the viewport-height container spilled below the viewport and the document
// grew its own scrollbar, on top of the container's `overflow-y: scroll` bar.
// Two scrollbars. Pinning the container with top/left keeps it in the viewport.
//
// A viewport-filling component should never make the *document* scroll.

// Minimal trigger: a flex host that vertically centres its content, exactly as
// Vite's default `body { display: flex; place-items: center; min-height: 100vh }`
// does. Applied to the real <body> so the document is the scroll root.
function applyCenteringHostCss() {
  const style = document.createElement('style')
  style.id = 'repro-2255'
  style.textContent = `
    body {
      margin: 0;
      display: flex;
      place-items: center;
      min-height: 100vh;
    }
  `
  document.head.appendChild(style)
  return style
}

function documentVerticalOverflow() {
  const el = document.documentElement
  return el.scrollHeight - el.clientHeight
}

describe('Parallax - double scrollbar (#2255)', () => {
  let hostStyle: HTMLStyleElement

  beforeEach(async () => {
    await page.viewport(WIDTH, HEIGHT)
    hostStyle = applyCenteringHostCss()
  })

  afterEach(() => {
    hostStyle.remove()
  })

  it('does not make the document scroll', async () => {
    render(
      <div style={{ width: '100%', height: '100%' }}>
        <Parallax pages={3} data-testid="container">
          <ParallaxLayer offset={0} speed={0.5} />
          <ParallaxLayer offset={1} speed={0.5} />
          <ParallaxLayer offset={2} speed={0.5} />
        </Parallax>
      </div>
    )

    // Let layout and Parallax's mount effects settle.
    await expect
      .poll(() => {
        const c = page.getByTestId('container').element() as HTMLElement
        return c.scrollHeight
      })
      .toBeGreaterThan(HEIGHT)

    // The container is the only scroll surface; the document must not scroll.
    expect(documentVerticalOverflow()).toBe(0)
  })

  it('control: a plain viewport-filling div does not make the document scroll', async () => {
    render(<div style={{ width: '100%', height: '100%' }}>plain content</div>)

    await new Promise(r => setTimeout(r, 100))

    // Proves the overflow is introduced by Parallax, not by the host CSS.
    expect(documentVerticalOverflow()).toBe(0)
  })
})
