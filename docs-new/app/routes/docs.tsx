import { LoaderFunction, Outlet, useLoaderData } from 'remix'
import { MDXProvider } from '@mdx-js/react'

import { styled } from '~/styles/stitches.config'

import { Header } from '../components/Header/Header'
import { Heading, HeadingProps } from '~/components/Text/Heading'
import { Copy, CopyProps } from '~/components/Text/Copy'
import { List, ListProps } from '~/components/Text/List'
import { Anchor, AnchorProps } from '~/components/Text/Anchor'

import { getNavigations } from '~/helpers/navigation'

import type {
  SubtitleSchemaItem,
  NavigationSchemaItem,
} from '../../scripts/docs/navigation'
import { Pre } from '~/components/Code/Pre'
import { H } from '~/components/Code/H'

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
          backgroundColor: '$steel-outline',
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

export const loader: LoaderFunction = ({ request }) => {
  const navigations = getNavigations(request.url)

  return navigations
}

export default function DocsLayout() {
  const navigation = useLoaderData<{
    subnav: SubtitleSchemaItem
    sidebar: NavigationSchemaItem
  }>()
  return (
    <>
      <Header data={navigation} />
      <Main>
        <MDXProvider components={comps}>
          <Outlet />
        </MDXProvider>
      </Main>
    </>
  )
}

const Main = styled('main', {
  padding: '0 $25',
  width: '100%',
  maxWidth: 'calc($document + 120px)',
  margin: '0 auto',
  pt: '140px',

  '@tabletUp': {
    padding: '0 $80',
    pt: '166px',
  },
})
