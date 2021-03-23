import { Globals, createStringInterpolator, colors } from '@react-spring/shared'
import { createHost } from '@react-spring/animated'
import { primitives } from './primitives'
import { WithAnimated } from './animated'

Globals.assign({
  createStringInterpolator,
  colors,
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
export * from '@react-spring/core'
