const linear = t => t

export default class Interpolation {
  static create(config) {
    if (typeof config === 'function') return (...args) => config(...args)
    if (config.output && typeof config.output[0] === 'string')
      return createInterpolationFromStringOutputRange(config)

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

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
var stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g

/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.
 */
function createInterpolationFromStringOutputRange(config) {
  const outputRange = config.output
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

  return input => {
    var i = 0
    return outputRange[0].replace(stringShapeRegex, () =>
      interpolations[i++](input)
    )
  }
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break
  return i - 1
}
