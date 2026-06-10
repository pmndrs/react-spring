import { applyProps, addEffect, invalidate } from '@react-three/fiber'

import { Globals } from '@react-spring/core'
import { createStringInterpolator, colors, raf } from '@react-spring/shared'
import { createHost } from '@react-spring/animated'

import { primitives } from './primitives'
import { WithAnimated } from './animated'

// With `frameloop="demand"`, r3f only runs its loop while frames are requested
// via `invalidate()`. rafz signals (via `onDemand`) whenever it has frame work
// pending — including the microtask gaps between looped/sequenced segments,
// where the spring is momentarily idle. We defer the `invalidate()` to a
// microtask: calling it from within `addEffect` (r3f's "before" phase) would
// only set the frame count to 1, which r3f's same-frame `update()` decrements
// back to 0. Deferring lets it land once the loop has stopped, cleanly
// restarting it. One request per frame is enough, so we dedupe.
let frameRequested = false
const requestFrame = () => {
  if (frameRequested) return
  frameRequested = true
  Promise.resolve().then(() => {
    frameRequested = false
    invalidate()
  })
}

Globals.assign({
  createStringInterpolator,
  colors,
  frameLoop: 'demand',
  onDemand: requestFrame,
})

// Let r3f drive the frameloop.
addEffect(() => {
  raf.advance()
})

const host = createHost(primitives, {
  applyAnimatedValues: applyProps,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from '@react-spring/core'
