import * as React from 'react'
import { useWindowResize } from '../hooks/useWindowResize'

import { DockContext } from './DockContext'

import styles from './styles.module.scss'

interface DockProps {
  children: React.ReactNode
}

export const Dock = ({ children }: DockProps) => {
  const [hovered, setHovered] = React.useState(false)
  const [width, setWidth] = React.useState(0)
  const dockRef = React.useRef<HTMLDivElement>(null!)

  useWindowResize(() => {
    setWidth(dockRef.current.clientWidth)
  })

  return (
    <DockContext.Provider value={{ hovered, width }}>
      <div
        ref={dockRef}
        className={styles.dock}
        onMouseOver={() => {
          setHovered(true)
        }}
        onMouseOut={() => {
          setHovered(false)
        }}>
        {children}
      </div>
    </DockContext.Provider>
  )
}
