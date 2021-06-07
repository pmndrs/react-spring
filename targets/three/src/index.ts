import { applyProps, addEffect } from '@react-three/fiber'

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

// Let r3f drive the frameloop.
addEffect(() => {
  raf.advance()
  return true
})

const host = createHost(primitives, {
  applyAnimatedValues: applyProps,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from '@react-spring/core'
