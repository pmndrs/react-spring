'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var shared_1 = require('shared')
var interpolate_1 = require('./interpolate')
var Animated_1 = require('./Animated')
var AnimatedValueArray = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedValueArray, _super)
  function AnimatedValueArray(values) {
    var _this = _super.call(this) || this
    _this.payload = values
    return _this
  }
  AnimatedValueArray.prototype.getValue = function() {
    return this.payload.map(function(v) {
      return v.getValue()
    })
  }
  AnimatedValueArray.prototype.setValue = function(value, flush) {
    var _this = this
    if (flush === void 0) {
      flush = true
    }
    if (shared_1.is.arr(value)) {
      if (value.length === this.payload.length) {
        value.forEach(function(v, i) {
          return _this.payload[i].setValue(v, flush)
        })
      }
    } else {
      this.payload.forEach(function(p) {
        return p.setValue(value, flush)
      })
    }
  }
  AnimatedValueArray.prototype.interpolate = function() {
    var args = []
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i]
    }
    return interpolate_1.interpolate.apply(void 0, [this].concat(args))
  }
  return AnimatedValueArray
})(Animated_1.AnimatedArray)
exports.AnimatedValueArray = AnimatedValueArray
