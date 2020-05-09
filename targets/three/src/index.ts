import { applyProps, addEffect, invalidate } from 'react-three-fiber'
import { Globals, FrameLoop } from 'core'
import { createHost } from 'animated'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'
import { primitives } from './primitives'
import { WithAnimated } from './animated'

// Let r3f drive the frameloop.
const frameLoop = new FrameLoop(() => invalidate())
addEffect(() => {
  frameLoop.advance()
  return true // Never stop.
})

Globals.assign({
  createStringInterpolator,
  colorNames,
  frameLoop,
})

const host = createHost(primitives, {
  applyAnimatedValues: applyProps,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from 'core'
