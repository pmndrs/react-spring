import {
  MetaFunction,
  LinksFunction,
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@vercel/remix'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { Analytics } from '@vercel/analytics/react'
import { WidgetPlausible } from './components/Widgets/WidgetPlausible'
import { lightThemeClass } from './styles/light-theme.css'
import global from './styles/global.css?url'
import docusearch from '@docsearch/css/dist/style.css?url'
import { getTheme, setTheme } from './helpers/theme.server'
import { darkThemeClass } from './styles/dark-theme.css'
import { ClientHintCheck, getHints } from './components/Site/SiteClientHints'
import { useTheme } from './hooks/useTheme'
import { SiteFooter } from './components/Site/SiteFooter'

export const meta: MetaFunction = () => {
  return [
    { title: 'react-spring' },
    {
      name: 'description',
      content:
        'Bring your components to life with simple spring animation primitives for React',
    },
    { property: 'og:site_name', content: 'React Spring' },
    { property: 'og:title', content: 'React Spring' },
    {
      property: 'og:description',
      content:
        'Bring your components to life with simple spring animation primitives for React',
    },
    { property: 'og:image', content: 'https://www.react-spring.dev/share.jpg' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:url', content: 'https://www.react-spring.dev' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:domain', content: 'react-spring.dev' },
    { property: 'twitter:url', content: 'https://www.react-spring.dev' },
    { property: 'twitter:title', content: 'React Spring' },
    {
      property: 'twitter:description',
      content:
        'Bring your components to life with simple spring animation primitives for React',
    },
    {
      property: 'twitter:image',
      content: 'https://www.react-spring.dev/share.jpg',
    },
  ]
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: docusearch },
  { rel: 'stylesheet', href: global },
  { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap',
  },
]

export const loader = ({ request }: LoaderFunctionArgs) => {
  return json({
    requestInfo: {
      hints: getHints(request),
      userPrefs: {
        theme: getTheme(request),
      },
    },
    ENV: {
      ENABLE_PLAUSIBLE: process.env.ENABLE_PLAUSIBLE,
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
      ENABLE_CARBON: process.env.ENABLE_CARBON,
    },
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json()
  const theme = body.theme ?? 'light'

  const responseInit = {
    headers: { 'set-cookie': setTheme(theme) },
  }
  return json({ ok: true }, responseInit)
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>()
  const theme = useTheme()

  return (
    <html lang="en">
      <head>
        <ClientHintCheck />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <WidgetPlausible />
      </head>
      <body className={theme === 'light' ? lightThemeClass : darkThemeClass}>
        {children}
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
