import { FluidValue } from 'shared'

export type TreeContext = {
  dependencies: Set<FluidValue>
}

export const TreeContext: { current: TreeContext | null } = { current: null }
