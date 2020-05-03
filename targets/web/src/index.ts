import { Globals } from 'core'
import { unstable_batchedUpdates } from 'react-dom'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'
import { createHost } from 'animated'
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
export * from 'core'
