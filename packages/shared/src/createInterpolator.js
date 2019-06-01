'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var globals_1 = require('./globals')
var _1 = require('.')
exports.createInterpolator = function(range, output, extrapolate) {
  if (_1.is.fun(range)) {
    return range
  }
  if (_1.is.arr(range)) {
    return exports.createInterpolator({
      range: range,
      output: output,
      extrapolate: extrapolate,
    })
  }
  if (_1.is.str(range.output[0])) {
    return globals_1.createStringInterpolator(range)
  }
  var config = range
  var outputRange = config.output
  var inputRange = config.range || [0, 1]
  var extrapolateLeft = config.extrapolateLeft || config.extrapolate || 'extend'
  var extrapolateRight =
    config.extrapolateRight || config.extrapolate || 'extend'
  var easing =
    config.easing ||
    function(t) {
      return t
    }
  return function(input) {
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
      config.map
    )
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
