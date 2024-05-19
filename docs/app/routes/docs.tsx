import { ReactNode, useMemo } from 'react'
import { Outlet, useLocation } from '@remix-run/react'
import { MDXProvider } from '@mdx-js/react'
import { PencilSimple } from 'phosphor-react'

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
import { LivePreviewStyles } from '~/components/Code/LivePreviewStyles'
import { Callout } from '~/components/Callout'
import { Feedback } from '~/components/Feedback/Feedback'

import {
  flattenNavigationWithChildren,
  getNavigations,
} from '~/helpers/navigation'
import { getDocFilePathToGithub } from '~/helpers/links'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'
import { WidgetCarbon } from '~/components/Widgets/WidgetCarbon'
import {
  h1,
  h2,
  h3,
  h4,
  h5,
  list,
  p,
  article,
  blockQuote,
  editAnchor,
  footer,
  grid,
  main,
  mainStickyMenu,
} from '../styles/routes/docs.css'

const comps = {
  h1: (props: HeadingProps) => (
    <Heading className={h1} fontStyle="XL" isLink {...props} />
  ),
  h2: (props: HeadingProps) => {
    return <Heading tag="h2" fontStyle="L" className={h2} isLink {...props} />
  },
  h3: (props: HeadingProps) => (
    <Heading tag="h3" fontStyle="M" className={h3} isLink {...props} />
  ),
  h4: (props: HeadingProps) => (
    <Heading tag="h4" fontStyle="S" className={h4} {...props} />
  ),
  h5: (props: HeadingProps) => (
    <Heading tag="h5" fontStyle="XS" className={h5} {...props} />
  ),
  h6: () => null,
  p: (props: CopyProps) => <Copy className={p} {...props} />,
  ul: (props: ListProps) => <List className={list} {...props} />,
  ol: (props: ListProps) => <List tag="ol" className={list} {...props} />,
  a: (props: AnchorProps) => <Anchor {...props} />,
  blockquote: (props: any) => <blockquote className={blockQuote} {...props} />,
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
    template?: keyof LivePreviewStyles
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
      template,
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
        showCode={showCode !== 'false'}
        template={template}
      >
        {children}
      </Code>
    )
  },
  H,
  warning: (props: { children?: ReactNode }) => (
    <Callout variant="warning" {...props} />
  ),
  note: (props: { children?: ReactNode }) => (
    <Callout variant="note" {...props} />
  ),
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
      <div className={grid}>
        <Header data={navigation} />
        <StickyAside hasSubNav={hasStickySubnav}>
          <MenuDocs submenu={navigation.sidebar} />
        </StickyAside>
        <main className={main}>
          {hasStickySubnav ? (
            <MenuSticky className={mainStickyMenu} subnav={navigation.subnav} />
          ) : null}
          <article
            className={article({
              hasStickySubnav,
            })}
          >
            <WidgetCarbon />
            {/* @ts-expect-error */}
            <MDXProvider components={comps}>
              <Outlet />
            </MDXProvider>
            <footer className={footer}>
              <Feedback location={activeRoute?.href} />
              <Anchor
                className={editAnchor}
                href={getDocFilePathToGithub(activeRoute)}
              >
                <PencilSimple
                  size={20}
                  weight={isDarkMode ? 'light' : 'regular'}
                />
                <span>Edit this page</span>
              </Anchor>
            </footer>
          </article>
        </main>
      </div>
    </>
  )
}
