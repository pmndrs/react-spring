import * as G from './globals'
import { is } from './helpers'
import { cssVariableRegex } from './regexs'

// Not all strings can be animated (eg: {display: "none"})
export function isAnimatedString(value: unknown): value is string {
  return (
    is.str(value) &&
    (value[0] == '#' ||
      /\d/.test(value) ||
      cssVariableRegex.test(value) ||
      value in (G.colors || {}))
  )
}
