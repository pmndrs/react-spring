import Interpolation from '../../animated/Interpolation'
import normalizeColor from './normalizeColors'
import colorNames from './colors'

function colorToRgba(input) {
  let int32Color = normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0
  let r = (int32Color & 0xff000000) >>> 24
  let g = (int32Color & 0x00ff0000) >>> 16
  let b = (int32Color & 0x0000ff00) >>> 8
  let a = (int32Color & 0x000000ff) / 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g

/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36)           // colors
 *   -45deg                            // values with units
 */
export default function createInterpolation(config) {
  const outputRange = config.output.map(colorToRgba)

  // ->
  // [
  //   [0, 50],
  //   [100, 150],
  //   [200, 250],
  //   [0, 0.5],
  // ]

  const outputRanges = outputRange[0].match(stringShapeRegex).map(() => [])
  outputRange.forEach(value => {
    value
      .match(stringShapeRegex)
      .forEach((number, i) => outputRanges[i].push(+number))
  })
  const interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map((value, i) => {
      return Interpolation.create({ ...config, output: outputRanges[i] })
    })
  const shouldRound = /^rgb/.test(outputRange[0])
  return input => {
    let i = 0
    return outputRange[0].replace(stringShapeRegex, () => {
      const val = interpolations[i++](input)
      return String(shouldRound && i < 4 ? Math.round(val) : val)
    })
  }
}
