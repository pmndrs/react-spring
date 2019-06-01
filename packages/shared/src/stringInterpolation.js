'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var createInterpolator_1 = require('./createInterpolator')
var normalizeColor_1 = require('./normalizeColor')
var colors_1 = require('./colors')
function colorToRgba(input) {
  var int32Color = normalizeColor_1.normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0
  var r = (int32Color & 0xff000000) >>> 24
  var g = (int32Color & 0x00ff0000) >>> 16
  var b = (int32Color & 0x0000ff00) >>> 8
  var a = (int32Color & 0x000000ff) / 255
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
}
// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
var stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
// Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e
var colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi
// Covers color names (transparent, blue, etc.)
var colorNamesRegex = new RegExp(
  '(' + Object.keys(colors_1.default).join('|') + ')',
  'g'
)
/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36)           // colors
 *   -45deg                            // values with units
 *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
 */
exports.createStringInterpolator = function(config) {
  // Replace colors with rgba
  var outputRange = config.output
    .map(function(rangeValue) {
      return rangeValue.replace(colorRegex, colorToRgba)
    })
    .map(function(rangeValue) {
      return rangeValue.replace(colorNamesRegex, colorToRgba)
    })
  var outputRanges = outputRange[0].match(stringShapeRegex).map(function() {
    return []
  })
  outputRange.forEach(function(value) {
    value.match(stringShapeRegex).forEach(function(number, i) {
      return outputRanges[i].push(+number)
    })
  })
  var interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map(function(_value, i) {
      return createInterpolator_1.createInterpolator(
        tslib_1.__assign({}, config, { output: outputRanges[i] })
      )
    })
  return function(input) {
    var i = 0
    return (
      outputRange[0]
        // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        .replace(stringShapeRegex, function() {
          return interpolations[i++](input)
        })
        // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
        // round the opacity (4th column).
        .replace(
          /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi,
          function(_, p1, p2, p3, p4) {
            return (
              'rgba(' +
              Math.round(p1) +
              ', ' +
              Math.round(p2) +
              ', ' +
              Math.round(p3) +
              ', ' +
              p4 +
              ')'
            )
          }
        )
    )
  }
}
