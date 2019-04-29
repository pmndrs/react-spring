import {
  createInterpolator,
  createAnimatedComponent,
  withExtend,
} from '../../animated'

export * from '../..'
export * from './Globals'

export const animated = withExtend(createAnimatedComponent)
export { animated as a }

/** @deprecated Use `animated.extend` instead */
export const apply = animated.extend

export const Interpolation = {
  create: createInterpolator,
}
