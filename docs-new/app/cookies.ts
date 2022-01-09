import { createCookie } from 'remix'

export const colorSchemeCookie = createCookie('preferred-color-scheme', {
  maxAge: 60 * 60 * 24 * 7, // one week
})

/**
 * Parse the preferred-color-scheme cookie
 */
export const getColorSchemeCookie = async (
  request: Request
): Promise<string | null> =>
  await colorSchemeCookie.parse(request.headers.get('Cookie'))

/**
 * Get the user's color scheme by default we
 * try and get the cookie (if it were set)
 * falling back to system preferences
 * and then if nothing else, just "light"
 */
export const getColorScheme = async (request: Request) => {
  const userSelectedColorScheme = await getColorSchemeCookie(request)
  const systemPreferredColorScheme = request.headers.get(
    'sec-ch-prefers-color-scheme'
  )

  return userSelectedColorScheme ?? systemPreferredColorScheme ?? ''
}
