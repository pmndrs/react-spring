import * as React from 'react'
import RefreshRuntime from 'react-refresh/runtime'
import { onTestFinished } from 'vitest'
import { render } from 'vitest-browser-react'
import { configure } from 'vitest-browser-react/pure'

let familyCount = 0

/**
 * Renders the component `define` returns, then `edit()` swaps in a fresh one
 * the way Fast Refresh applies a saved edit: hook state is kept and effects
 * re-run. Runs outside StrictMode, where React skips re-running `[]` effects
 * on a refresh.
 */
export async function renderWithFastRefresh(define: () => React.FC) {
  const id = `FastRefresh${familyCount++}`
  const Component = define()
  configure({ reactStrictMode: false })
  onTestFinished(() => configure({ reactStrictMode: true }))
  RefreshRuntime.register(Component, id)
  await render(<Component />)
  return {
    edit() {
      RefreshRuntime.register(define(), id)
      RefreshRuntime.performReactRefresh()
    },
  }
}
