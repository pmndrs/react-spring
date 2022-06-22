import { Outlet, useLocation } from 'remix'
import { MDXProvider } from '@mdx-js/react'

import { styled } from '~/styles/stitches.config'

import { Header } from '../components/Header/Header'
import { Heading, HeadingProps } from '~/components/Text/Heading'
import { Copy, CopyProps } from '~/components/Text/Copy'
import { List, ListProps } from '~/components/Text/List'
import { Anchor, AnchorProps } from '~/components/Text/Anchor'

import { getNavigations } from '~/helpers/navigation'

import { H } from '~/components/Code/H'
import { MenuDocs } from '~/components/Menu/MenuDocs'
import { MenuSticky } from '~/components/Menu/MenuSticky'
import { StickyAside } from '~/components/Asides/StickyAside'
import { Code } from '~/components/Code/Code'

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
        '& > code': {
          backgroundColor: '$steel20',
          borderRadius: '$r4',
          py: 2,
          px: 5,
        },
        '& > a': {
          position: 'relative',

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
  pre: (props: {
    children: string
    showLineNumbers?: string
    id?: string
    line?: string
    live?: string
    code: string
  }) => {
    const { children, code, showLineNumbers, id, line, live } = props
    return (
      <Code
        id={id}
        showLineNumbers={showLineNumbers === ''}
        data-showing-lines={Boolean(line)}
        isLive={Boolean(live)}
        code={code}>
        {children}
      </Code>
    )
  },
  H,
}

export default function DocsLayout() {
  const location = useLocation()
  const navigation = getNavigations(location.pathname)

  const hasStickySubnav = navigation.subnav && navigation.subnav.length > 0

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
  padding: '0 $25 $50 $25',
  width: '100%',

  '@tabletUp': {
    padding: '0 6.2rem 10rem 6.2rem',
    maxWidth: '$document',
    margin: '0 auto',
  },

  variants: {
    hasStickySubnav: {
      false: {
        paddingTop: 27,
      },
    },
  },
})
