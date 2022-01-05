import { isSSR } from './helpers'
import { cssVariableRegex } from './regexs'

/**
 * takes a CSS variable and attempts
 * to turn it into a RGBA value
 *
 * ```
 * 'var(--white)' => 'rgba(255,255,255,1)'
 * ```
 *
 * @param input string
 * @returns string
 */
export const variableToRgba = (input: string): string => {
  const [token, fallback] = parseCSSVariable(input)

  if (!token || isSSR()) {
    return input
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(token)

  if (value) {
    /**
     * We have a valid variable returned
     * trim and return
     */
    return value.trim()
  } else if (fallback && fallback.startsWith('--')) {
    /**
     * fallback is something like --my-variable
     * so we try get property value
     */
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(fallback)

    /**
     * if it exists, return else nothing was found so just return the input
     */
    if (value) {
      return value
    } else {
      return input
    }
  } else if (fallback && cssVariableRegex.test(fallback)) {
    /**
     * We have a fallback and it's another CSS variable
     */
    return variableToRgba(fallback)
  } else if (fallback) {
    /**
     * We have a fallback and it's not a CSS variable
     */
    return fallback
  }

  /**
   * Nothing worked so just return the input
   * like our other FluidValue replace functions do
   */
  return input
}

const parseCSSVariable = (current: string) => {
  const match = cssVariableRegex.exec(current)
  if (!match) return [,]

  const [, token, fallback] = match
  return [token, fallback]
}
