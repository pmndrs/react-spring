'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var shared_1 = require('shared')
var interpolate_1 = require('./interpolate')
var Animated_1 = require('./Animated')
var AnimatedValue_1 = require('./AnimatedValue')
var AnimatedValueArray_1 = require('./AnimatedValueArray')
var AnimatedInterpolation = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedInterpolation, _super)
  function AnimatedInterpolation(parents, args) {
    var _this = _super.call(this) || this
    _this.calc = shared_1.createInterpolator.apply(void 0, args)
    _this.payload = Array.isArray(parents)
      ? parents.map(AnimatedValue_1.AnimatedValue.from)
      : parents instanceof AnimatedValueArray_1.AnimatedValueArray
      ? parents.getPayload()
      : [parents]
    return _this
  }
  AnimatedInterpolation.prototype.getValue = function() {
    var args = this.payload.map(function(value) {
      return value.getValue()
    })
    return this.calc.apply(this, args)
  }
  AnimatedInterpolation.prototype.interpolate = function() {
    var args = []
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i]
    }
    return interpolate_1.interpolate.apply(void 0, [this].concat(args))
  }
  return AnimatedInterpolation
})(Animated_1.AnimatedArray)
exports.AnimatedInterpolation = AnimatedInterpolation
