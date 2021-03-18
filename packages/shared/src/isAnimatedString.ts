import * as G from './globals'
import { is } from './helpers'

// Not all strings can be animated (eg: {display: "none"})
export function isAnimatedString(value: unknown): value is string {
  return (
    is.str(value) &&
    (value[0] == '#' || /\d/.test(value) || value in (G.colors || {}))
  )
}
