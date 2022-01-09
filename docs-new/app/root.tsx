import {
  HeadersFunction,
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'
import type { MetaFunction, LinksFunction } from 'remix'

import { getColorScheme } from './cookies'

import { globalStyles } from './styles/global'
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicEffect'
import { useState } from 'react'

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

export const headers: HeadersFunction = () => ({
  'Accept-CH': 'Sec-CH-Prefers-Color-Scheme, Sec-CH-Prefers-Reduced-Motion',
})

export const loader: LoaderFunction = async ({ request }) => ({
  colorScheme: await getColorScheme(request),
})

function Document({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useLoaderData<{ colorScheme: string }>()
  const [theme, setTheme] = useState(colorScheme)

  globalStyles()

  useIsomorphicLayoutEffect(() => {
    if (!theme) {
      setTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      )
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={theme}>
        {children}
        {/* <Scripts /> */}
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
