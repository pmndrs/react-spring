import * as G from './globals'
import { is, isSSR } from './helpers'
import { cssVariableRegex } from './regexs'

// Not all strings can be animated (eg: {display: "none"})
export function isAnimatedString(value: unknown): value is string {
  return (
    is.str(value) &&
    (value[0] == '#' ||
      /\d/.test(value) ||
      // Do not identify a CSS variable as an AnimatedString if its SSR
      (!isSSR() && cssVariableRegex.test(value)) ||
      value in (G.colors || {}))
  )
}
