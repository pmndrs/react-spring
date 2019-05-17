import * as Globals from './animated/Globals'
import { AnimatedStyle } from './animated/AnimatedStyle'
import { AnimatedInterpolation } from './animated/AnimatedInterpolation'

Globals.assign({
  createAnimatedStyle: style => new AnimatedStyle(style),
  createAnimatedInterpolation: (parents: any, ...args: [any]) =>
    new AnimatedInterpolation(parents, args),
})

export { useChain } from './useChain'
export { useSpring } from './useSpring'
export { useSprings } from './useSprings'
export { useTrail } from './useTrail'
export { useTransition } from './useTransition'

export { config } from './shared/constants'
export { interpolate } from './interpolate'
export { Controller } from './animated/Controller'
export { isAnimated } from './animated/Animated'

export * from './legacy'
