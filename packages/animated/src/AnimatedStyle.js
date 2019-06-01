'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var Animated_1 = require('./Animated')
var globals_1 = require('shared/globals')
var AnimatedStyle = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedStyle, _super)
  function AnimatedStyle(style) {
    if (style === void 0) {
      style = {}
    }
    return (
      _super.call(
        this,
        style.transform && globals_1.createAnimatedTransform
          ? tslib_1.__assign({}, style, {
              transform: globals_1.createAnimatedTransform(style.transform),
            })
          : style
      ) || this
    )
  }
  return AnimatedStyle
})(Animated_1.AnimatedObject)
exports.AnimatedStyle = AnimatedStyle
