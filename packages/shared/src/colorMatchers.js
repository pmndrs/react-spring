'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
// const INTEGER = '[-+]?\\d+';
var NUMBER = '[-+]?\\d*\\.?\\d+'
var PERCENTAGE = NUMBER + '%'
function call() {
  var parts = []
  for (var _i = 0; _i < arguments.length; _i++) {
    parts[_i] = arguments[_i]
  }
  return '\\(\\s*(' + parts.join(')\\s*,\\s*(') + ')\\s*\\)'
}
exports.rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER))
exports.rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER))
exports.hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE))
exports.hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER))
exports.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
exports.hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
exports.hex6 = /^#([0-9a-fA-F]{6})$/
exports.hex8 = /^#([0-9a-fA-F]{8})$/
