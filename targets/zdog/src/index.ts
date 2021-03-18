import { applyProps } from 'react-zdog'
import { Globals } from '@react-spring/core'
import { createStringInterpolator, colors } from '@react-spring/shared'
import { createHost } from '@react-spring/animated'
import { primitives } from './primitives'
import { WithAnimated } from './animated'

Globals.assign({
  createStringInterpolator,
  colors,
})

const host = createHost(primitives, {
  applyAnimatedValues: applyProps,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from '@react-spring/core'
