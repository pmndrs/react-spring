import { cssVariableRegex } from './regexs'

export const variableToRgba = (input: string) => {
  console.log('input', input)
  const [token, fallback] = parseCSSVariable(input)

  console.log('token', token, 'fallback', fallback)
  console.log(
    'var',
    window.getComputedStyle(document.documentElement).getPropertyValue(token)
  )
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(token)
}

const parseCSSVariable = (current: string) => {
  const match = cssVariableRegex.exec(current)
  if (!match) return [,]

  const [, token, fallback] = match
  return [token, fallback]
}
