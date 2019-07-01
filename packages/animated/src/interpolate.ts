import { SpringInterpolator } from 'shared'
import { createAnimatedInterpolation as to } from 'shared/globals'
import { deprecateInterpolate } from 'shared/deprecations'

const interpolate: SpringInterpolator = (...args: [any, any]) => {
  deprecateInterpolate()
  return to(...args)
}

export { to, interpolate }
