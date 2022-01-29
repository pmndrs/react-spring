import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { List } from 'phosphor-react'

import { styled } from '~/styles/stitches.config'

import { Logo } from '../Logo'
import { HeaderNavigation } from './HeaderNavigation'

import type {
  NavigationSchema,
  SubtitleSchemaItem,
} from '../../../scripts/docs/navigation'
import { HeaderSubnav } from './HeaderSubnav'
import { HeaderSidePanel } from './HeaderSidePanel'

interface HeaderProps {
  data?: {
    sidebar: NavigationSchema
    subnav: SubtitleSchemaItem
  }
}

export const Header = ({ data }: HeaderProps) => {
  const { sidebar, subnav } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const handleNavigationClick = () => setDialogOpen(false)

  return (
    <Head hasSubNav={Boolean(subnav)}>
      <MaxWidth withPadding>
        <DesktopNavigation />
        <Dialog.Root open={dialogOpen} onOpenChange={handleDialogChange}>
          <MobileMenuButton>
            <HamburgerMenu size={20} />
          </MobileMenuButton>
          <Dialog.Portal forceMount>
            <HeaderSidePanel
              onNavigationClick={handleNavigationClick}
              isOpen={dialogOpen}
              submenu={sidebar}
            />
          </Dialog.Portal>
        </Dialog.Root>
        <Logo />
      </MaxWidth>
      <MaxWidth>{subnav ? <HeaderSubnav subnav={subnav} /> : null}</MaxWidth>
      {/* {subnav ? <Divider /> : null} */}
    </Head>
  )
}

const Head = styled('header', {
  width: '100%',
  py: '$15',
  position: 'fixed',
  background: '$white',
  zIndex: '$1',
  // debug: 'purple',

  '@tabletUp': {
    py: '$25',
  },

  variants: {
    hasSubNav: {
      true: {
        pb: '0',
        '@tabletUp': {
          pb: '0',
        },
      },
    },
  },
})

const MaxWidth = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '$document',
  margin: '0 auto',

  variants: {
    withPadding: {
      true: {
        px: '$25',

        '@tabletUp': {
          px: '$50',
        },
      },
    },
  },
})

const DesktopNavigation = styled(HeaderNavigation, {
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

const HamburgerMenu = styled(List, {
  color: '$black',
})

// const Divider = styled('div', {
//   mx: '$25',
//   borderTop: 'solid 1px $steel40',
// })
