import { useLocation } from '@remix-run/react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'phosphor-react'
import { animated, useTransition } from '@react-spring/web'
import * as Toolbar from '@radix-ui/react-toolbar'

import { HeaderNavigation } from './HeaderNavigation'
import { HeaderSubNavigation } from './HeaderSubNavigation'
import { MenuDocs } from '../Menu/MenuDocs'

import { NavigationSchema } from '../../../scripts/docs/navigation'
import { SiteThemePicker } from '../Site/SiteThemePicker'
import { forwardRef } from 'react'
import {
  mainNavigation,
  mobileDialogHeader,
  mobileMenu,
  mobileMenuClose,
  mobileMenuOverlay,
  mobileThemePicker,
  subNavContainer,
} from './HeaderSidePanel.css'
import { visuallyHidden } from '../../styles/utilities.css'

interface HeaderSidePanelProps {
  isOpen: boolean
  submenu?: NavigationSchema
  onNavigationClick?: () => void
}

export const HeaderSidePanel = forwardRef<HTMLDivElement, HeaderSidePanelProps>(
  ({ isOpen, submenu, onNavigationClick }, ref) => {
    const location = useLocation()

    const isDocs = location.pathname.includes('/docs')

    const transitions = useTransition(isOpen, {
      from: {
        x: '100%',
        opacity: 0,
      },
      enter: {
        x: '0',
        opacity: 1,
      },
      leave: {
        x: '100%',
        opacity: 0,
      },
      config: {
        tension: 210,
        friction: 30,
        mass: 1,
      },
    })

    const handleNavClick = () => {
      if (onNavigationClick) {
        onNavigationClick()
      }
    }

    return transitions(({ opacity, x }, item) =>
      item ? (
        <>
          <Dialog.Overlay forceMount asChild>
            <animated.div className={mobileMenuOverlay} style={{ opacity }} />
          </Dialog.Overlay>
          {/* @ts-ignore */}
          <Dialog.Content trapFocus={false} forceMount asChild>
            <animated.div className={mobileMenu} ref={ref} style={{ x }}>
              <div>
                <header className={mobileDialogHeader}>
                  <Dialog.Close className={mobileMenuClose}>
                    <X />
                  </Dialog.Close>
                  <Toolbar.Root className={mobileThemePicker}>
                    <SiteThemePicker />
                  </Toolbar.Root>
                </header>
                <Dialog.Title className={visuallyHidden}>
                  Main Menu
                </Dialog.Title>
                <HeaderNavigation
                  className={mainNavigation({ isDocsSection: isDocs })}
                  showSubNav={false}
                  showThemePicker={false}
                  showLabels={!isDocs}
                />
              </div>
              <MenuDocs submenu={submenu} onNavClick={handleNavClick} />
              <Toolbar.Root
                className={subNavContainer({
                  isDocsSection: isDocs,
                })}
              >
                <HeaderSubNavigation showLabels={!isDocs} />
              </Toolbar.Root>
            </animated.div>
          </Dialog.Content>
        </>
      ) : null
    )
  }
)
