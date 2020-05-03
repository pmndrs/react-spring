import { FluidValue } from 'shared'
import { HostConfig } from './createHost'

export type TreeContext = {
  dependencies: Set<FluidValue>
  host: HostConfig
}

export const TreeContext: { current: TreeContext | null } = { current: null }
