'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
function isAnimated(val) {
  return val instanceof Animated
}
exports.isAnimated = isAnimated
var Animated = /** @class */ (function() {
  function Animated() {
    this.children = []
  }
  Animated.prototype.getAnimatedValue = function() {
    return this.getValue()
  }
  Animated.prototype.getPayload = function() {
    return this.payload || this
  }
  Animated.prototype.attach = function() {}
  Animated.prototype.detach = function() {}
  Animated.prototype.getChildren = function() {
    return this.children
  }
  Animated.prototype.addChild = function(child) {
    if (this.children.length === 0) this.attach()
    this.children.push(child)
  }
  Animated.prototype.removeChild = function(child) {
    var index = this.children.indexOf(child)
    this.children.splice(index, 1)
    if (this.children.length === 0) this.detach()
  }
  return Animated
})()
exports.Animated = Animated
var AnimatedArray = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedArray, _super)
  function AnimatedArray() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  AnimatedArray.prototype.attach = function() {
    var _this = this
    this.payload.forEach(function(p) {
      return isAnimated(p) && p.addChild(_this)
    })
  }
  AnimatedArray.prototype.detach = function() {
    var _this = this
    this.payload.forEach(function(p) {
      return isAnimated(p) && p.removeChild(_this)
    })
  }
  return AnimatedArray
})(Animated)
exports.AnimatedArray = AnimatedArray
var AnimatedObject = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedObject, _super)
  function AnimatedObject(payload) {
    var _this = _super.call(this) || this
    _this.payload = payload
    return _this
  }
  AnimatedObject.prototype.getValue = function(animated) {
    if (animated === void 0) {
      animated = false
    }
    var payload = {}
    for (var key in this.payload) {
      var value = this.payload[key]
      if (animated && !isAnimated(value)) continue
      payload[key] = isAnimated(value)
        ? value[animated ? 'getAnimatedValue' : 'getValue']()
        : value
    }
    return payload
  }
  AnimatedObject.prototype.getAnimatedValue = function() {
    return this.getValue(true)
  }
  AnimatedObject.prototype.attach = function() {
    var _this = this
    Object.values(this.payload).forEach(function(s) {
      return isAnimated(s) && s.addChild(_this)
    })
  }
  AnimatedObject.prototype.detach = function() {
    var _this = this
    Object.values(this.payload).forEach(function(s) {
      return isAnimated(s) && s.removeChild(_this)
    })
  }
  return AnimatedObject
})(Animated)
exports.AnimatedObject = AnimatedObject
