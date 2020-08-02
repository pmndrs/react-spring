import { applyProps } from 'react-zdog'
import { Globals } from '@react-spring/core'
import { createHost } from '@react-spring/animated'
import { createStringInterpolator } from '@react-spring/shared/src/stringInterpolation'
import colorNames from '@react-spring/shared/src/colors'
import { primitives } from './primitives'
import { WithAnimated } from './animated'

Globals.assign({
  createStringInterpolator,
  colorNames,
})

const host = createHost(primitives, {
  applyAnimatedValues: applyProps,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from '@react-spring/core'
