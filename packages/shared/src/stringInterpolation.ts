import { InterpolatorConfig } from '@react-spring/types'

import { getFluidValue } from './fluids'
import { createInterpolator } from './createInterpolator'
import { colorToRgba } from './colorToRgba'
import * as G from './globals'
import {
  cssVariableRegex,
  colorRegex,
  unitRegex,
  numberRegex,
  rgbaRegex,
} from './regexs'
import { variableToRgba } from './variableToRgba'

// Covers color names (transparent, blue, etc.)
let namedColorRegex: RegExp

// rgba requires that the r,g,b are integers.... so we want to round them,
// but we *dont* want to round the opacity (4th column).
const rgbaRound = (_: any, p1: number, p2: number, p3: number, p4: number) =>
  `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`

// Extract the numeric tokens from a string. Strings with no numbers — e.g.
// `boxShadow: 'none'` or an unresolved CSS variable that falls through as its
// literal `var(--x)` text — yield `[]` rather than throwing on a null match.
// See https://github.com/pmndrs/react-spring/issues/2327
const getNumbers = (value: string) => value.match(numberRegex) ?? []

/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *     "rgba(123, 42, 99, 0.36)"           // colors
 *     "-45deg"                            // values with units
 *     "0 2px 2px 0px rgba(0, 0, 0, 0.12)" // CSS box-shadows
 *     "rotate(0deg) translate(2px, 3px)"  // CSS transforms
 */
export const createStringInterpolator = (
  config: InterpolatorConfig<string>
) => {
  if (!namedColorRegex)
    namedColorRegex = G.colors
      ? // match color names, ignore partial matches
        new RegExp(`(${Object.keys(G.colors).join('|')})(?!\\w)`, 'g')
      : // never match
        /^\b$/

  // Convert colors to rgba(...)
  const output = config.output.map(value => {
    return getFluidValue(value)
      .replace(cssVariableRegex, variableToRgba)
      .replace(colorRegex, colorToRgba)
      .replace(namedColorRegex, colorToRgba)
  })

  // Convert ["1px 2px", "0px 0px"] into [[1, 2], [0, 0]]
  const keyframes = output.map(value => getNumbers(value).map(Number))

  // Convert ["1px 2px", "0px 0px"] into [[1, 0], [2, 0]]
  const outputRanges = keyframes[0].map((_, i) =>
    keyframes.map(values => {
      if (!(i in values)) {
        throw Error('The arity of each "output" value must be equal')
      }
      return values[i]
    })
  )

  // Create an interpolator for each animated number
  const interpolators = outputRanges.map(output =>
    createInterpolator({ ...config, output })
  )

  const inputRange = config.range || [0, 1]

  // Per number-position, the shared fractional-digit count across all
  // keyframes — or `null` when keyframes disagree or every keyframe is
  // a whole number. Whole-number keyframes are left untouched so that
  // values like the alpha channel in `rgba(…, 0)` → `rgba(…, 1)` keep
  // their natural sub-frame precision.
  const allTokens = output.map(value => getNumbers(value))
  const decimalCounts = allTokens[0].map((_, pos) => {
    const counts = allTokens.map(tokens => {
      const token = tokens[pos]
      const dot = token.indexOf('.')
      return dot === -1 ? 0 : token.length - dot - 1
    })
    return counts.every(c => c === counts[0]) && counts[0] > 0
      ? counts[0]
      : null
  })

  // Use the first `output` as a template for each call
  return (input: number) => {
    // When `input` lands exactly on a keyframe, return that keyframe's
    // output verbatim so token-level formatting (trailing zeros, signs,
    // locale separators) survives the round-trip through `numberRegex`.
    const keyIdx = inputRange.indexOf(input)
    if (keyIdx !== -1) return output[keyIdx]

    // Convert numbers to units if available (allows for ["0", "100%"])
    const missingUnit =
      !unitRegex.test(output[0]) &&
      output.find(value => unitRegex.test(value))?.replace(numberRegex, '')

    let i = 0
    return output[0]
      .replace(numberRegex, () => {
        const pos = i++
        const value = interpolators[pos](input)
        const decimals = decimalCounts[pos]
        const formatted = decimals != null ? value.toFixed(decimals) : value
        return `${formatted}${missingUnit || ''}`
      })
      .replace(rgbaRegex, rgbaRound)
  }
}
