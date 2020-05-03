import { applyProps } from 'react-zdog'
import { Globals } from 'core'
import { createHost } from 'animated'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'
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
export * from 'core'
