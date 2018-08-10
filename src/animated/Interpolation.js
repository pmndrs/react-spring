import * as Globals from './Globals'

const linear = t => t

export default class Interpolation {
  static create(config) {
    if (typeof config === 'function') return config
    if (
      Globals.interpolation &&
      config.output &&
      typeof config.output[0] === 'string'
    )
      return Globals.interpolation(config)
    var outputRange = config.output
    var inputRange = config.range
    var easing = config.easing || linear
    var extrapolateLeft = 'extend'
    var map = config.map

    if (config.extrapolateLeft !== undefined) {
      extrapolateLeft = config.extrapolateLeft
    } else if (config.extrapolate !== undefined) {
      extrapolateLeft = config.extrapolate
    }

    var extrapolateRight = 'extend'
    if (config.extrapolateRight !== undefined) {
      extrapolateRight = config.extrapolateRight
    } else if (config.extrapolate !== undefined) {
      extrapolateRight = config.extrapolate
    }

    return input => {
      var range = findRange(input, inputRange)
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
  var result = map ? map(input) : input

  // Extrapolate
  if (result < inputMin) {
    if (extrapolateLeft === 'identity') {
      return result
    } else if (extrapolateLeft === 'clamp') {
      result = inputMin
    } else if (extrapolateLeft === 'extend') {
      // noop
    }
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') {
      return result
    } else if (extrapolateRight === 'clamp') {
      result = inputMax
    } else if (extrapolateRight === 'extend') {
      // noop
    }
  }

  if (outputMin === outputMax) return outputMin
  if (inputMin === inputMax) {
    if (input <= inputMin) return outputMin
    return outputMax
  } // Input Range

  if (inputMin === -Infinity) {
    result = -result
  } else if (inputMax === Infinity) {
    result = result - inputMin
  } else {
    result = (result - inputMin) / (inputMax - inputMin)
  } // Easing

  result = easing(result) // Output Range

  if (outputMin === -Infinity) {
    result = -result
  } else if (outputMax === Infinity) {
    result = result + outputMin
  } else {
    result = result * (outputMax - outputMin) + outputMin
  }
  return result
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break
  return i - 1
}
