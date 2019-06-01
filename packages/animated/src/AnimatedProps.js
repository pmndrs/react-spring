'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var Animated_1 = require('./Animated')
var globals_1 = require('shared/globals')
/**
 * Wraps the `style` property with `AnimatedStyle`.
 */
var AnimatedProps = /** @class */ (function(_super) {
  tslib_1.__extends(AnimatedProps, _super)
  function AnimatedProps(props, callback) {
    var _this =
      _super.call(
        this,
        props.style && globals_1.createAnimatedStyle
          ? tslib_1.__assign({}, props, {
              style: globals_1.createAnimatedStyle(props.style),
            })
          : props
      ) || this
    _this.update = callback
    _this.attach()
    return _this
  }
  return AnimatedProps
})(Animated_1.AnimatedObject)
exports.AnimatedProps = AnimatedProps
