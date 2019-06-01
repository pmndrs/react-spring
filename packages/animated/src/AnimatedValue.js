'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var Animated_1 = require('./Animated')
var shared_1 = require('shared')
var interpolate_1 = require('./interpolate')
var globals_1 = require('shared/globals')
/**
 * Animated works by building a directed acyclic graph of dependencies
 * transparently when you render your Animated components.
 *
 *               new Animated.Value(0)
 *     .interpolate()        .interpolate()    new Animated.Value(1)
 *         opacity               translateY      scale
 *          style                         transform
 *         View#234                         style
 *                                         View#123
 *
 * A) Top Down phase
 * When an AnimatedValue is updated, we recursively go down through this
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */
function addAnimatedStyles(node, styles) {
  if ('update' in node) {
    styles.add(node)
  } else {
    node.getChildren().forEach(function(child) {
      return addAnimatedStyles(child, styles)
    })
  }
}
var AnimatedValue = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedValue, _super)
  function AnimatedValue(value) {
    var _this = _super.call(this) || this
    _this.animatedStyles = new Set()
    _this.done = false
    _this.setValue = function(value, flush) {
      if (flush === void 0) {
        flush = true
      }
      _this.value = value
      if (flush) _this.flush()
    }
    _this.value = value
    if (shared_1.is.num(value)) {
      _this.startPosition = value
      _this.lastPosition = value
    }
    return _this
  }
  AnimatedValue.from = function(value) {
    return Animated_1.isAnimated(value) ? value : new AnimatedValue(value)
  }
  AnimatedValue.prototype.getValue = function() {
    return this.value
  }
  AnimatedValue.prototype.interpolate = function() {
    var args = []
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i]
    }
    return interpolate_1.interpolate.apply(void 0, [this].concat(args))
  }
  AnimatedValue.prototype.reset = function(isActive) {
    if (shared_1.is.num(this.value)) {
      this.startPosition = this.value
      this.lastPosition = this.value
      this.lastVelocity = isActive ? this.lastVelocity : undefined
      this.lastTime = isActive ? this.lastTime : undefined
      this.startTime = globals_1.now()
    }
    this.done = false
    this.animatedStyles.clear()
  }
  AnimatedValue.prototype.clearStyles = function() {
    this.animatedStyles.clear()
  }
  AnimatedValue.prototype.flush = function() {
    if (this.animatedStyles.size === 0) {
      addAnimatedStyles(this, this.animatedStyles)
    }
    this.animatedStyles.forEach(function(animatedStyle) {
      return animatedStyle.update()
    })
  }
  return AnimatedValue
})(Animated_1.Animated)
exports.AnimatedValue = AnimatedValue
