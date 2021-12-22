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
  const keyframes = output.map(value => value.match(numberRegex)!.map(Number))

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

  // Use the first `output` as a template for each call
  return (input: number) => {
    // Convert numbers to units if available (allows for ["0", "100%"])
    const missingUnit =
      !unitRegex.test(output[0]) &&
      output.find(value => unitRegex.test(value))?.replace(numberRegex, '')

    let i = 0
    return output[0]
      .replace(
        numberRegex,
        () => `${interpolators[i++](input)}${missingUnit || ''}`
      )
      .replace(rgbaRegex, rgbaRound)
  }
}
