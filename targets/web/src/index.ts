import { Globals } from '@react-spring/core'
import { unstable_batchedUpdates } from 'react-dom'
import { createStringInterpolator } from '@react-spring/shared/src/stringInterpolation'
import colorNames from '@react-spring/shared/src/colors'
import { createHost } from '@react-spring/animated'
import { applyAnimatedValues } from './applyAnimatedValues'
import { AnimatedStyle } from './AnimatedStyle'
import { WithAnimated } from './animated'
import { primitives } from './primitives'

Globals.assign({
  colorNames,
  createStringInterpolator,
  batchedUpdates: unstable_batchedUpdates,
})

const host = createHost(primitives, {
  applyAnimatedValues,
  createAnimatedStyle: style => new AnimatedStyle(style),
  getComponentProps: ({ scrollTop, scrollLeft, ...props }) => props,
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from '@react-spring/core'
