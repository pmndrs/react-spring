import { applyProps, addEffect, invalidate } from '@react-three/fiber'

import { Globals } from '@react-spring/core'
import { createStringInterpolator, colors, raf } from '@react-spring/shared'
import { createHost } from '@react-spring/animated'

import { primitives } from './primitives'
import { WithAnimated } from './animated'

Globals.assign({
  createStringInterpolator,
  colors,
  frameLoop: 'demand',
})

raf.onFrame(() => {
  invalidate()
})

// Let r3f drive the frameloop.
addEffect(() => {
  raf.advance()
})

const host = createHost(primitives, {
  // @ts-expect-error r3f related
  applyAnimatedValues: applyProps,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from '@react-spring/core'
