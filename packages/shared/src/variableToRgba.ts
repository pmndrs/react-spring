import { cssVariableRegex } from './regexs'

export const variableToRgba = (input: string): string => {
  const [token, fallback] = parseCSSVariable(input)

  if (!token) {
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
