import { getFluidValue } from './fluids'
import { createInterpolator } from './createInterpolator'
import { InterpolatorConfig } from '@react-spring/types'
import { colorToRgba } from './colorToRgba'
import * as G from './globals'

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const numberRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g

// Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e
const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi

// Gets numbers with units when specified
const unitRegex = new RegExp(`(${numberRegex.source})(%|[a-z]+)`, 'i')

// Covers color names (transparent, blue, etc.)
let namedColorRegex: RegExp

// rgba requires that the r,g,b are integers.... so we want to round them,
// but we *dont* want to round the opacity (4th column).
const rgbaRegex = /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi
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
  const output = config.output.map(value =>
    getFluidValue(value)
      .replace(colorRegex, colorToRgba)
      .replace(namedColorRegex, colorToRgba)
  )

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
