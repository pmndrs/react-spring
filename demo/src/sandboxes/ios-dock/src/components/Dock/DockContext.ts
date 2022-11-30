import { createContext, useContext } from 'react'

type DockApi = {
  hovered: boolean
  width: number
}

export const DockContext = createContext<DockApi>({ width: 0, hovered: false })

export const useDock = () => {
  return useContext(DockContext)
}
