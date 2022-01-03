import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import type { MetaFunction, LinksFunction } from 'remix'

import { useForceUpdate } from './hooks/useForceUpdate'
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicEffect'

import { getCssText } from './styles/stitches.config'
import { globalStyles } from './styles/global'

export const meta: MetaFunction = () => {
  return {
    title: 'react-spring',
    description:
      'Bring your components to life with simple spring animation primitives for React',
  }
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
]

function Document({ children }: { children: React.ReactNode }) {
  globalStyles()

  const forceUpdate = useForceUpdate()

  useIsomorphicLayoutEffect(() => {
    /**
     * Force update on useLayoutEffect
     * So that the tree has rendered and
     * getCssText from stitches will have
     * all the styled components
     */
    forceUpdate()
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </head>
      <body>
        {children}
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
      <ScrollRestoration />
    </Document>
  )
}
