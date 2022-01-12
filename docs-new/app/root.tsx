import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  MetaFunction,
  LinksFunction,
} from 'remix'

import { globalStyles } from './styles/global'

import { SiteThemePicker } from './components/Site/SiteThemePicker'

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

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {/* <SiteThemePicker /> */}
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
