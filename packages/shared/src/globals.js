'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
//
// Optional
//
exports.now = function() {
  return Date.now()
}
exports.colorNames = {}
exports.createAnimatedRef = function(node) {
  return node.current
}
exports.requestAnimationFrame =
  typeof window !== 'undefined' ? window.requestAnimationFrame : function() {}
exports.cancelAnimationFrame =
  typeof window !== 'undefined' ? window.cancelAnimationFrame : function() {}
exports.assign = function(globals) {
  var _a
  return (
    (_a = Object.assign(
      {
        now: exports.now,
        frameLoop: exports.frameLoop,
        colorNames: exports.colorNames,
        defaultElement: exports.defaultElement,
        applyAnimatedValues: exports.applyAnimatedValues,
        createStringInterpolator: exports.createStringInterpolator,
        createAnimatedInterpolation: exports.createAnimatedInterpolation,
        createAnimatedTransform: exports.createAnimatedTransform,
        createAnimatedStyle: exports.createAnimatedStyle,
        createAnimatedRef: exports.createAnimatedRef,
        requestAnimationFrame: exports.requestAnimationFrame,
        cancelAnimationFrame: exports.cancelAnimationFrame,
      },
      globals
    )),
    (exports.now = _a.now),
    (exports.frameLoop = _a.frameLoop),
    (exports.colorNames = _a.colorNames),
    (exports.defaultElement = _a.defaultElement),
    (exports.applyAnimatedValues = _a.applyAnimatedValues),
    (exports.createStringInterpolator = _a.createStringInterpolator),
    (exports.createAnimatedInterpolation = _a.createAnimatedInterpolation),
    (exports.createAnimatedTransform = _a.createAnimatedTransform),
    (exports.createAnimatedStyle = _a.createAnimatedStyle),
    (exports.createAnimatedRef = _a.createAnimatedRef),
    (exports.requestAnimationFrame = _a.requestAnimationFrame),
    (exports.cancelAnimationFrame = _a.cancelAnimationFrame),
    _a
  )
}
