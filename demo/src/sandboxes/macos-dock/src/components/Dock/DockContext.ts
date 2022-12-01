import { createContext, useContext } from 'react'
import { SpringValue } from '@react-spring/web'

type DockApi = {
  hovered: boolean
  width: number
  zoomLevel?: SpringValue
  setIsZooming: (isZooming: boolean) => void
}

export const DockContext = createContext<DockApi>({ width: 0, hovered: false, setIsZooming: () => {} })

export const useDock = () => {
  return useContext(DockContext)
}
