import { Outlet, useLocation } from 'remix'
import { MDXProvider } from '@mdx-js/react'

import { styled } from '~/styles/stitches.config'

import { Header, HEADER_HEIGHT } from '../components/Header/Header'
import { Heading, HeadingProps } from '~/components/Text/Heading'
import { Copy, CopyProps } from '~/components/Text/Copy'
import { List, ListProps } from '~/components/Text/List'
import { Anchor, AnchorProps } from '~/components/Text/Anchor'

import { getNavigations } from '~/helpers/navigation'

import { Pre } from '~/components/Code/Pre'
import { H } from '~/components/Code/H'
import { MenuDocs } from '~/components/Menu/MenuDocs'
import { MenuSticky } from '~/components/Menu/MenuSticky'
import { StickyAside } from '~/components/Asides/StickyAside'

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
          mt: 400,
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
  pre: ({
    children,
    showLineNumbers,
    id,
    line,
  }: {
    children: string
    showLineNumbers?: string
    id?: string
    line?: string
  }) => {
    return (
      <Pre
        id={id}
        showLineNumbers={showLineNumbers === ''}
        data-showing-lines={Boolean(line)}>
        {children}
      </Pre>
    )
  },
  H,
}

export default function DocsLayout() {
  const location = useLocation()
  const navigation = getNavigations(location.pathname)

  return (
    <>
      <Grid>
        <Header data={navigation} />
        <StickyAside>
          <MenuDocs submenu={navigation.sidebar} />
        </StickyAside>
        <Main>
          <MainStickyMenu subnav={navigation.subnav} />
          <Article>
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

  '@documentUp': {
    maxWidth: '$document',
  },
})

const MainStickyMenu = styled(MenuSticky, {
  display: 'none',
  width: 'inherit',
  maxWidth: 'inherit',

  '@tabletUp': {
    display: 'flex',
  },
})

const Article = styled('article', {
  padding: '0 $25',
  width: '100%',

  '@tabletUp': {
    padding: '0 6.2rem',
  },
})
