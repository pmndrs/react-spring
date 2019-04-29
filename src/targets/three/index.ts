import * as THREE from 'three'
import { createAnimatedComponent, withExtend } from '../../animated'
import { CreateAnimatedComponent } from '../../types/animated'

export * from '../..'
export * from './Globals'

export { update } from '../../animated/FrameLoop'

// TODO: Support type-checking for `animated` props
type ThreeComponents = {
  [key: string]: React.ComponentType<{ [key: string]: any }>
}

const elements = Object.keys(THREE).filter(key => /^[A-Z]/.test(key))

// Extend animated with all the available THREE elements
export const animated = withExtend(
  createAnimatedComponent as CreateAnimatedComponent & ThreeComponents,
  { lowercase: true }
).extend(elements, 'primitive')

export { animated as a }

/** @deprecated Use `animated.extend` instead */
export const apply = animated.extend
