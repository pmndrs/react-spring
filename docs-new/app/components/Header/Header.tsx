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
import { useWindowScrolling } from '~/hooks/useWindowScrolling'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

interface HeaderProps {
  data?: {
    sidebar: NavigationSchema
    subnav: SubtitleSchemaItem
  }
}

export const Header = ({ data }: HeaderProps) => {
  const { sidebar, subnav } = data ?? {}
  const [dialogOpen, setDialogOpen] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)

  const scrollState = useWindowScrolling({
    active: true,
    threshold: 0,
  })

  const handleDialogChange = (isOpen: boolean) => setDialogOpen(isOpen)

  const handleNavigationClick = () => setDialogOpen(false)

  useIsomorphicLayoutEffect(() => {
    const { innerWidth } = window
    const { direction, scrollTop } = scrollState

    const limit = innerWidth < 768 ? 15 + 48 : 64 + 25

    if (scrollTop >= limit) {
      setStickyHeader(true)
    } else {
      setStickyHeader(false)
    }
  }, [scrollState])

  return (
    <Head isStuck={stickyHeader} hasSubNav={Boolean(subnav)}>
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
  backgroundColor: 'rgba(250, 250, 250, 0.80)',
  backdropFilter: 'blur(5px)',
  zIndex: '$1',

  '@supports not (backdrop-filter: blur(10px))': {
    backgroundColor: '$white',
  },

  '& + main': {
    pt: '$10',
  },

  '@tabletUp': {
    py: '$25',

    '& + main': {
      pt: '0',
    },
  },

  // Give a good offset for the jump links
  '& + main h2::before': {
    display: 'block',
    content: ' ',
    marginTop: '-48px',
    height: '48px',
    visibility: 'hidden',
    pointerEvents: 'none',

    '@tabletUp': {
      marginTop: '-64px',
      height: '64px',
    },
  },

  variants: {
    isStuck: {
      true: {
        position: 'fixed',
        top: `calc((var(--space-15) + 48px) * -1)`,

        '& + main': {
          pt: `12.5rem`,
        },

        '@tabletUp': {
          top: `calc((var(--space-25) + 64px) * -1)`,

          '& + main': {
            pt: `14.1rem`,
          },
        },
      },
    },
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
