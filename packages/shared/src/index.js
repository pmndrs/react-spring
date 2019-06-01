'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var react_1 = require('react')
tslib_1.__exportStar(require('./createInterpolator'), exports)
var Globals = require('./globals')
exports.Globals = Globals
exports.is = {
  arr: Array.isArray,
  obj: function(a) {
    return !!a && a.constructor.name === 'Object'
  },
  fun: function(a) {
    return typeof a === 'function'
  },
  str: function(a) {
    return typeof a === 'string'
  },
  num: function(a) {
    return typeof a === 'number'
  },
  und: function(a) {
    return a === void 0
  },
  boo: function(a) {
    return typeof a === 'boolean'
  },
}
function useForceUpdate() {
  var _a = react_1.useState(false),
    f = _a[1]
  var forceUpdate = react_1.useCallback(function() {
    return f(function(v) {
      return !v
    })
  }, [])
  return forceUpdate
}
exports.useForceUpdate = useForceUpdate
