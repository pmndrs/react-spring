import { CSSProperties, useState } from 'react'
import { assignInlineVars } from '@vanilla-extract/dynamic'
import * as Dialog from '@radix-ui/react-dialog'
import { List } from 'phosphor-react'
import { animated } from '@react-spring/web'

import { useAnimatedHeader } from '~/hooks/useAnimatedHeader'

import { Logo } from '../Logo'

import type {
  NavigationSchema,
  SubtitleSchemaItem,
} from '../../../scripts/docs/navigation'

import { HeaderNavigation } from './HeaderNavigation'
import { HeaderSidePanel } from './HeaderSidePanel'
import {
  desktopNavigation,
  flexContainer,
  hamburgerMenu,
  header,
  mobileMenuButton,
  mobileHeight as mobileHeightVar,
  desktopHeight as desktopHeightVar,
  headerStuck,
  headerScrolledDown,
  headerTransparentBackground,
  headerAddMarginToMain,
  headerSpacing,
} from './Header.css'
import clsx from 'clsx'

interface HeaderProps {
  data?: {
    sidebar: NavigationSchema
    subnav: SubtitleSchemaItem
  }
  className?: string
  transparentBackground?: boolean
  addMarginToMain?: boolean
  alwaysAnimateHeader?: boolean
  position?: CSSProperties['position']
}

export const getHeaderHeights = (): [desktop: number, mobile: number] => [
  114, 78,
]

export const Header = ({
  data,
  className,
  transparentBackground = false,
  addMarginToMain = true,
  position,
  alwaysAnimateHeader,
}: HeaderProps) => {
  const { sidebar, subnav = [] } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)

  const headerHeights = getHeaderHeights()

  const [styles, isStuck, scrollTop, direction] = useAnimatedHeader({
    isHeader: true,
    alwaysAnimate: alwaysAnimateHeader,
    heights: headerHeights,
  })

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const handleNavigationClick = () => setDialogOpen(false)

  const [desktopHeight, mobileHeight] = headerHeights

  return (
    <>
      {isStuck && (
        <div
          className={headerSpacing}
          style={{
            ...assignInlineVars({
              [mobileHeightVar]: `${mobileHeight}px`,
              [desktopHeightVar]: `${desktopHeight}px`,
            }),
          }}
        />
      )}
      <animated.header
        className={clsx(
          header,
          isStuck && headerStuck,
          (subnav.length > 0 || (scrollTop > 20 && direction === 'up')) &&
            headerScrolledDown,
          transparentBackground && headerTransparentBackground,
          addMarginToMain && headerAddMarginToMain,
          className
        )}
        style={{
          ...styles,
          position,
          ...assignInlineVars({
            [mobileHeightVar]: `${mobileHeight}px`,
            [desktopHeightVar]: `${desktopHeight}px`,
          }),
        }}
      >
        <div className={flexContainer}>
          <HeaderNavigation className={desktopNavigation} />
          <Dialog.Root open={dialogOpen} onOpenChange={handleDialogChange}>
            <Dialog.Trigger className={mobileMenuButton}>
              <List className={hamburgerMenu} size={20} />
            </Dialog.Trigger>
            <Dialog.Portal forceMount>
              <HeaderSidePanel
                onNavigationClick={handleNavigationClick}
                isOpen={dialogOpen}
                submenu={sidebar}
              />
            </Dialog.Portal>
          </Dialog.Root>
          <Logo />
        </div>
      </animated.header>
    </>
  )
}
