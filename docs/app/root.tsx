import {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  json,
} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import docusearch from '@docsearch/css/dist/style.css'

import { globalStyles } from './styles/global'

import { SiteThemePicker } from './components/Site/SiteThemePicker'
import { WidgetPlausible } from './components/Widgets/WidgetPlausible'
import { SiteFooter } from './components/Site/SiteFooter'

export const meta: MetaFunction = () => {
  return {
    title: 'react-spring',
    description:
      'Bring your components to life with simple spring animation primitives for React',
  }
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: docusearch },
  { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap',
  },
]

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      ENABLE_PLAUSIBLE: process.env.ENABLE_PLAUSIBLE,
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
    },
  })
}

function Document({ children }: { children: React.ReactNode }) {
  globalStyles()

  const data = useLoaderData()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <WidgetPlausible />
        <SiteThemePicker />
      </head>
      <body>
        {children}
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(data.ENV)}`,
          }}
        />
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
