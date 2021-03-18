import { FluidValue } from '@react-spring/shared'

export type TreeContext = {
  /**
   * Any animated values found when updating the payload of an `AnimatedObject`
   * are also added to this `Set` to be observed by an animated component.
   */
  dependencies: Set<FluidValue> | null
}

export const TreeContext: TreeContext = { dependencies: null }
