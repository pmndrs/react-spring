import { parseCookie, stringifySetCookie } from 'cookie'

const cookieName = 'en_theme'
export type Theme = 'light' | 'dark'

export function getTheme(request: Request): Theme | null {
  const cookieHeader = request.headers.get('cookie')
  const parsed = cookieHeader ? parseCookie(cookieHeader)[cookieName] : 'light'
  if (parsed === 'light' || parsed === 'dark') return parsed
  return null
}

export function setTheme(theme: Theme) {
  return stringifySetCookie({
    name: cookieName,
    value: theme,
    path: '/',
    maxAge: 31536000,
  })
}
