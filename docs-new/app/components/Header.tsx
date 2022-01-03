import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { animated, useSpring } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

import { Logo } from './Logo'
import { Navigation } from './Navigation'
import { useWindowSize } from '~/hooks/useWindowSize'

export const Header = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mountElements, setMountElements] = useState(false)
  const { width } = useWindowSize()

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const [{ x, opacity }, api] = useSpring(() => ({
    x: '-100%',
    opacity: 0,
    config: {
      tension: 210,
      friction: 25,
      mass: 1,
    },
  }))

  useIsomorphicLayoutEffect(() => {
    if (dialogOpen) {
      api.start({
        x: '0',
        opacity: 1,
        onStart: () => setMountElements(true),
      })
    } else {
      api.start({
        x: '-100%',
        opacity: 0,
        onRest: () => setMountElements(false),
      })
    }
  }, [dialogOpen])

  return (
    <Head>
      <MaxWidth>
        <DesktopNavigation />
        <Dialog.Root onOpenChange={handleDialogChange}>
          <MobileMenuButton>
            <HamburgerMenu height={20} width={20} />
          </MobileMenuButton>
          <Dialog.Portal forceMount>
            {/* @ts-expect-error this issue has been raised https://github.com/radix-ui/primitives/pull/1060 */}
            <MobileMenuOverlay forceMount={mountElements} style={{ opacity }} />
            {/* @ts-expect-error this issue has been raised https://github.com/radix-ui/primitives/pull/1060 */}
            <MobileMenu forceMount={mountElements} style={{ x }}>
              <HiddenTitle>Main Menu</HiddenTitle>
              <a href="https://www.google.com">link to google</a>
              <Dialog.Close />
            </MobileMenu>
          </Dialog.Portal>
        </Dialog.Root>
        <Logo width={width < 768 ? '48px' : '64px'} />
      </MaxWidth>
    </Head>
  )
}

const Head = styled('header', {
  width: '100%',
  background: '$white',
  padding: '$15 $25',

  '@tabletUp': {
    padding: '$25 $50',
  },
})

const MaxWidth = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '$document',
  margin: '0 auto',
})

const DesktopNavigation = styled(Navigation, {
  display: 'none',

  '@tabletUp': {
    display: 'flex',
  },
})

const MobileMenuButton = styled(Dialog.Trigger, {
  margin: 0,
  padding: '0.8rem 0.8rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  marginLeft: '-0.8rem',

  '@tabletUp': {
    display: 'none',
  },
})

const HamburgerMenu = styled(HamburgerMenuIcon, {
  color: '$black',
})

const MobileMenuOverlay = styled(animated(Dialog.Overlay), {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(10px)',

  '@supports not (backdrop-filter: blur(10px))': {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
})

const MobileMenu = styled(animated(Dialog.Content), {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  height: '100vh',
  width: '20rem',
  background: '$white',
  zIndex: 1,
  boxShadow: '3px 0 12px -10px rgba(0,0,0,0.5)',
})

const HiddenTitle = styled(Dialog.Title, {
  visuallyHidden: '',
})
