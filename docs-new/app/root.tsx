import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import type { MetaFunction } from 'remix'

import { getCssText } from './styles/stitches.config'
import { globalStyles } from './styles/global'

export const meta: MetaFunction = () => {
  return {
    title: 'react-spring',
    description:
      'Bring your components to life with simple spring animation primitives for React',
  }
}

export default function App() {
  // globalStyles()

  console.log('styles', getCssText())

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <style
          id="stitches"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
