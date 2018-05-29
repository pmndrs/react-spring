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
 *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
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

  /* $FlowFixMe(>=0.18.0): `outputRange[0].match()` can return `null`. Need to
     * guard against this possibility.
     */
  const outputRanges = outputRange[0].match(stringShapeRegex).map(() => [])
  outputRange.forEach(value => {
    /* $FlowFixMe(>=0.18.0): `value.match()` can return `null`. Need to guard
       * against this possibility.
       */
    value
      .match(stringShapeRegex)
      .forEach((number, i) => outputRanges[i].push(+number))
  })

  /* $FlowFixMe(>=0.18.0): `outputRange[0].match()` can return `null`. Need to
       * guard against this possibility.
       */
  const interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map((value, i) => {
      return Interpolation.create({ ...config, output: outputRanges[i] })
    })

  return input => {
    let i = 0
    return (
      outputRange[0]
        // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        .replace(stringShapeRegex, () => interpolations[i++](input))
        // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
        // round the opacity (4th column).
        .replace(
          /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi,
          (_, r, g, b, a) =>
            `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
        )
    )
  }
}
