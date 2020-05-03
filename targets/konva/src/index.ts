import { Globals } from 'shared'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'
import { createHost } from 'animated'
import { primitives } from './primitives'
import { WithAnimated } from './animated'

Globals.assign({
  createStringInterpolator,
  colorNames,
})

const host = createHost(primitives, {
  applyAnimatedValues(instance, props) {
    if (!instance.nodeType) return false
    instance._applyProps(instance, props)
  },
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from 'core'
