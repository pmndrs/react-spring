export type ClientHint<Value> = {
  cookieName: string
  getValueCode: string
  fallback: Value
  transform?: (value: string) => Value
}

export type ClientHintsValue<ClientHintsRecord> = {
  [K in keyof ClientHintsRecord]: ClientHintsRecord[K] extends ClientHint<
    infer Value
  >
    ? ClientHintsRecord[K]['transform'] extends (value: string) => Value
      ? ReturnType<ClientHintsRecord[K]['transform']>
      : ClientHintsRecord[K]['fallback']
    : never
}

export function getHintUtils<Hints extends Record<string, ClientHint<any>>>(
  hints: Hints
) {
  function getCookieValue(cookieString: string, name: string) {
    const hint = hints[name]
    if (!hint) {
      throw new Error(
        `Unknown client hint: ${typeof name === 'string' ? name : 'Unknown'}`
      )
    }
    const value = cookieString
      .split(';')
      .map((c: string) => c.trim())
      .find((c: string) => c.startsWith(hint.cookieName + '='))
      ?.split('=')[1]

    return value ? decodeURIComponent(value) : null
  }

  function getHints(request?: Request): ClientHintsValue<Hints> {
    const cookieString =
      typeof document !== 'undefined'
        ? document.cookie
        : typeof request !== 'undefined'
          ? (request.headers.get('Cookie') ?? '')
          : ''

    return Object.entries(hints).reduce((acc, [name, hint]) => {
      const hintName = name
      if ('transform' in hint) {
        // @ts-expect-error - this is fine (PRs welcome though)
        acc[hintName] = hint.transform(
          getCookieValue(cookieString, hintName) ?? hint.fallback
        )
      } else {
        // @ts-expect-error - this is fine (PRs welcome though)
        acc[hintName] = getCookieValue(cookieString, hintName) ?? hint.fallback
      }
      return acc
    }, {} as ClientHintsValue<Hints>)
  }

  /**
   * This returns a string of JavaScript that can be used to check if the client
   * hints have changed and will reload the page if they have.
   */
  function getClientHintCheckScript() {
    return `
// This block of code allows us to check if the client hints have changed and
// force a reload of the page with updated hints if they have so you don't get
// a flash of incorrect content.
function checkClientHints() {
	if (!navigator.cookieEnabled) return;

	// set a short-lived cookie to make sure we can set cookies
	document.cookie = "canSetCookies=1; Max-Age=60; SameSite=Lax";
	const canSetCookies = document.cookie.includes("canSetCookies=1");
	document.cookie = "canSetCookies=; Max-Age=-1; path=/";
	if (!canSetCookies) return;

	const cookies = document.cookie.split(';').map(c => c.trim()).reduce((acc, cur) => {
		const [key, value] = cur.split('=');
		acc[key] = value;
		return acc;
	}, {});

	let cookieChanged = false;
	const hints = [
	${Object.values(hints)
    .map(hint => {
      const cookieName = JSON.stringify(hint.cookieName)
      return `{ name: ${cookieName}, actual: String(${hint.getValueCode}), value: cookies[${cookieName}] != null ? cookies[${cookieName}] : encodeURIComponent("${hint.fallback}") }`
    })
    .join(',\n')}
	];
	for (const hint of hints) {
		document.cookie = encodeURIComponent(hint.name) + '=' + encodeURIComponent(hint.actual) + '; Max-Age=31536000; path=/';
		if (decodeURIComponent(hint.value) !== hint.actual) {
			cookieChanged = true;
		}
	}
	if (cookieChanged) window.location.reload();
}

checkClientHints();
`
  }

  return { getHints, getClientHintCheckScript }
}

export const themeClientHint = {
  cookieName: 'CH-prefers-color-scheme',
  getValueCode: `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`,
  fallback: 'light',
  transform(value) {
    return value === 'dark' ? 'dark' : 'light'
  },
} as const satisfies ClientHint<'dark' | 'light'>

/**
 * Subscribe to changes in the user's color scheme preference. Optionally pass
 * in a cookie name to use for the cookie that will be set if different from the
 * default.
 */
export function subscribeToSchemeChange(
  subscriber: (value: 'dark' | 'light') => void,
  cookieName: string = themeClientHint.cookieName
) {
  const schemaMatch = window.matchMedia('(prefers-color-scheme: dark)')
  function handleThemeChange() {
    const value = schemaMatch.matches ? 'dark' : 'light'
    document.cookie = `${cookieName}=${value}; Max-Age=31536000; Path=/`
    subscriber(value)
  }
  schemaMatch.addEventListener('change', handleThemeChange)
  return function cleanupSchemaChange() {
    schemaMatch.removeEventListener('change', handleThemeChange)
  }
}
