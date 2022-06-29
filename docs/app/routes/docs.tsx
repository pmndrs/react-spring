import { useMemo } from 'react'
import { Outlet, useLocation } from '@remix-run/react'
import { MDXProvider } from '@mdx-js/react'
import { PencilSimple } from 'phosphor-react'

import { styled } from '~/styles/stitches.config'
import { getFontStyles } from '~/styles/fontStyles'

import { Header } from '../components/Header/Header'
import { Heading, HeadingProps } from '~/components/Text/Heading'
import { Copy, CopyProps } from '~/components/Text/Copy'
import { List, ListProps } from '~/components/Text/List'
import { Anchor, AnchorProps } from '~/components/Text/Anchor'
import { H } from '~/components/Code/H'
import { MenuDocs } from '~/components/Menu/MenuDocs'
import { MenuSticky } from '~/components/Menu/MenuSticky'
import { StickyAside } from '~/components/Asides/StickyAside'
import { Code } from '~/components/Code/Code'

import {
  flattenNavigationWithChildren,
  getNavigations,
} from '~/helpers/navigation'
import { getDocFilePathToGithub } from '~/helpers/links'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

const comps = {
  h1: (props: HeadingProps) => (
    <Heading
      fontStyle="$XL"
      css={{
        mb: 20,
        '@tabletUp': {
          mb: 30,
        },
      }}
      {...props}
    />
  ),
  h2: (props: HeadingProps) => (
    <Heading
      tag="h2"
      fontStyle="$L"
      css={{
        mt: 30,
        mb: 15,

        '@tabletUp': {
          mt: 40,
          mb: 20,
        },
      }}
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <Heading
      tag="h3"
      fontStyle="$M"
      css={{
        mt: 30,
        mb: 15,

        '@tabletUp': {
          mt: 40,
          mb: 20,
        },
      }}
      {...props}
    />
  ),
  h4: (props: HeadingProps) => (
    <Heading
      tag="h4"
      fontStyle="$S"
      css={{
        mt: 30,
        mb: 15,

        '@tabletUp': {
          mt: 40,
          mb: 20,
        },
      }}
      {...props}
    />
  ),
  h5: (props: HeadingProps) => (
    <Heading
      tag="h5"
      fontStyle="$XS"
      css={{
        mt: 30,
        mb: 4,
        textTransform: 'uppercase',

        '@tabletUp': {
          mt: 40,
          mb: 6,
        },
      }}
      {...props}
    />
  ),
  h6: () => null,
  p: (props: CopyProps) => (
    <Copy
      css={{
        '& + &': {
          mt: 15,
        },
        '& + pre': {
          my: 40,
        },
        '& > code': {
          backgroundColor: '$steel20',
          borderRadius: '$r4',
          py: 2,
          px: 5,
        },
        '& > a': {
          position: 'relative',
          textDecoration: 'none',

          '&:after': {
            position: 'absolute',
            bottom: -1,
            left: 0,
            content: '',
            width: '100%',
            height: 2,
            backgroundColor: '$red100',

            '@motion': {
              transition: 'width 200ms ease-out',
            },
          },

          '&:hover:after': {
            width: 0,
            left: 'unset',
            right: 0,
          },
        },
        maxWidth: 680,
      }}
      {...props}
    />
  ),
  ul: (props: ListProps) => (
    <List
      css={{
        mt: 15,
      }}
      {...props}
    />
  ),
  ol: (props: ListProps) => (
    <List
      tag="ol"
      css={{
        mt: 15,
      }}
      {...props}
    />
  ),
  a: (props: AnchorProps) => <Anchor {...props} />,
  blockquote: (props: any) => <BlockQuote as="blockquote" {...props} />,
  pre: (props: {
    children: string
    showLineNumbers?: string
    id?: string
    line?: string
    live?: string
    code: string
    copy?: string
    defaultOpen?: string
    showCode?: string
  }) => {
    const {
      defaultOpen,
      children,
      code,
      showLineNumbers,
      id,
      line,
      live,
      copy,
      showCode,
    } = props

    return (
      <Code
        id={id}
        showLineNumbers={showLineNumbers === ''}
        data-showing-lines={Boolean(line)}
        isLive={Boolean(live)}
        code={code}
        copy={copy}
        defaultOpen={defaultOpen === 'true'}
        showCode={showCode !== 'false'}>
        {children}
      </Code>
    )
  },
  H,
}

export default function DocsLayout() {
  const location = useLocation()
  const navigation = getNavigations(location.pathname)

  const isDarkMode = useIsDarkTheme()

  const hasStickySubnav = navigation.subnav && navigation.subnav.length > 0

  const flatRoutes = useMemo(
    () => flattenNavigationWithChildren(navigation.sidebar),
    [navigation.sidebar]
  )

  const activeRoute = flatRoutes.find(item => item.href === location.pathname)

  return (
    <>
      <Grid>
        <Header data={navigation} />
        <StickyAside hasSubNav={hasStickySubnav}>
          <MenuDocs submenu={navigation.sidebar} />
        </StickyAside>
        <Main>
          {hasStickySubnav ? (
            <MainStickyMenu subnav={navigation.subnav} />
          ) : null}
          <Article hasStickySubnav={hasStickySubnav}>
            <MDXProvider components={comps}>
              <Outlet />
            </MDXProvider>
            <Footer>
              <EditAnchor href={getDocFilePathToGithub(activeRoute)}>
                <PencilSimple
                  size={20}
                  weight={isDarkMode ? 'light' : 'regular'}
                />
                <span>Edit this page</span>
              </EditAnchor>
            </Footer>
          </Article>
        </Main>
      </Grid>
    </>
  )
}

const Grid = styled('div', {
  '@tabletUp': {
    display: 'grid',
    maxHeight: '100%',
    overflow: 'hidden',
    gridTemplateColumns: '30rem 1fr 1fr',
    gridTemplateAreas: `
      "header header header"
      "aside main main"
    `,
  },

  '& > header': {
    gridArea: 'header',
  },
})

const Main = styled('main', {
  position: 'relative',
  flex: '1',
  gridArea: 'main',
  width: '100%',
  margin: '0 auto',

  '@tabletUp': {
    maxWidth: 'calc(100vw - 30rem)',
  },
})

const MainStickyMenu = styled(MenuSticky, {
  width: 'inherit',
  maxWidth: 'inherit',

  '@tabletUp': {
    display: 'flex',
  },
})

const Article = styled('article', {
  padding: '0 $25 $30 $25',
  width: '100%',
  mt: '$15',

  '@tabletUp': {
    padding: '0 6.2rem $80 6.2rem',
    maxWidth: '$document',
    margin: '0 auto',
    mt: '$25',
  },

  variants: {
    hasStickySubnav: {
      false: {
        paddingTop: 27,
      },
    },
  },
})

const Footer = styled('footer', {
  mt: '$40',
})

const EditAnchor = styled(Anchor, {
  ...getFontStyles('$XXS'),
  textDecoration: 'none',
  fontWeight: '$default',
  color: '$steel40',
  display: 'inline-flex',
  alignItems: 'center',

  '& > span': {
    ml: '$5',
  },

  '&:hover': {
    '& > span': {
      textDecoration: 'underline',
    },
  },
})

const BlockQuote = styled('blockquote', {
  my: '$30',
  position: 'relative',
  ml: '$20',
  opacity: 0.7,

  '&:before': {
    content: '""',
    height: '100%',
    width: 1,
    backgroundColor: '$black',
    position: 'absolute',
    top: 0,
    left: -20,
  },
})
