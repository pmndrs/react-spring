import * as Globals from './Globals'

type ExtrapolateType = 'identity' | 'clamp' | 'extend'

type InputRange = number[]
type OutputRange = number[] | string[]

/**
 * The config options for an interpolation.
 */
export type InterpolationConfig<In = number, Out = number | string> = {
  /**
   * @default 'extend'
   */
  extrapolateLeft?: ExtrapolateType
  /**
   * @default 'extend'
   */
  extrapolateRight?: ExtrapolateType
  /**
   * Shortcut to set `extrapolateLeft` and `extrapolateRight`
   * @default 'extend'
   */
  extrapolate?: ExtrapolateType
  /**
   * Input ranges
   * @default [0,1]
   */
  range: In[]
  output: Out[]
  map?: (value: number) => number
  easing?: (t: number) => number
}

type Interpolator = (input: number) => number | string

export default class Interpolation {
  static create(interpolator: Interpolator): Interpolator
  static create(range: InputRange, output: OutputRange): Interpolator
  static create(config: InterpolationConfig): Interpolator
  static create(
    range: InputRange | InterpolationConfig | Interpolator,
    output?: OutputRange,
    extra?: ExtrapolateType
  ): Interpolator {
    if (typeof range === 'function') {
      return range
    }
    if (Array.isArray(range)) {
      return Interpolation.create({
        range,
        output: output!,
        extrapolate: extra || 'extend',
      })
    }
    if (Globals.interpolation && typeof range.output[0] === 'string') {
      return Globals.interpolation(range as InterpolationConfig<number, string>)
    }
    let config = range as InterpolationConfig<number, number>
    let outputRange = config.output
    let inputRange = config.range || [0, 1]
    let easing = config.easing || ((t: number) => t)
    let extrapolateLeft: ExtrapolateType = 'extend'
    let map = config.map

    if (config.extrapolateLeft !== undefined)
      extrapolateLeft = config.extrapolateLeft
    else if (config.extrapolate !== undefined)
      extrapolateLeft = config.extrapolate

    let extrapolateRight: ExtrapolateType = 'extend'
    if (config.extrapolateRight !== undefined)
      extrapolateRight = config.extrapolateRight
    else if (config.extrapolate !== undefined)
      extrapolateRight = config.extrapolate

    return (input: number) => {
      let range = findRange(input, inputRange)
      return interpolate(
        input,
        inputRange[range],
        inputRange[range + 1],
        outputRange[range],
        outputRange[range + 1],
        easing,
        extrapolateLeft,
        extrapolateRight,
        map
      )
    }
  }
}

function interpolate(
  input: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  easing: (t: number) => number,
  extrapolateLeft: ExtrapolateType,
  extrapolateRight: ExtrapolateType,
  map?: (x: number) => number
) {
  let result = map ? map(input) : input
  // Extrapolate
  if (result < inputMin) {
    if (extrapolateLeft === 'identity') return result
    else if (extrapolateLeft === 'clamp') result = inputMin
  }
  if (result > inputMax) {
    if (extrapolateRight === 'identity') return result
    else if (extrapolateRight === 'clamp') result = inputMax
  }
  if (outputMin === outputMax) return outputMin
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax
  // Input Range
  if (inputMin === -Infinity) result = -result
  else if (inputMax === Infinity) result = result - inputMin
  else result = (result - inputMin) / (inputMax - inputMin)
  // Easing
  result = easing(result)
  // Output Range
  if (outputMin === -Infinity) result = -result
  else if (outputMax === Infinity) result = result + outputMin
  else result = result * (outputMax - outputMin) + outputMin
  return result
}

function findRange(input: number, inputRange: number[]) {
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break
  return i - 1
}
