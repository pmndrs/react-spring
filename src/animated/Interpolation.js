import * as Globals from './Globals'

export default class Interpolation {
  // Default config = config, args
  // Short config   = range, output, extrapolate
  static create(config, output, extra) {
    if (typeof config === 'function') return config
    else if (
      Globals.interpolation &&
      config.output &&
      typeof config.output[0] === 'string'
    )
      return Globals.interpolation(config)
    else if (Array.isArray(config))
      return Interpolation.create({
        range: config,
        output,
        extrapolate: extra || 'extend',
      })

    let outputRange = config.output
    let inputRange = config.range || [0, 1]
    let easing = config.easing || (t => t)
    let extrapolateLeft = 'extend'
    let map = config.map

    if (config.extrapolateLeft !== undefined)
      extrapolateLeft = config.extrapolateLeft
    else if (config.extrapolate !== undefined)
      extrapolateLeft = config.extrapolate

    let extrapolateRight = 'extend'
    if (config.extrapolateRight !== undefined)
      extrapolateRight = config.extrapolateRight
    else if (config.extrapolate !== undefined)
      extrapolateRight = config.extrapolate

    return input => {
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
  input,
  inputMin,
  inputMax,
  outputMin,
  outputMax,
  easing,
  extrapolateLeft,
  extrapolateRight,
  map
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

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break
  return i - 1
}
