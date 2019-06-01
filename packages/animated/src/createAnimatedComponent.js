'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var react_1 = require('react')
var globals_1 = require('shared/globals')
var shared_1 = require('shared')
var AnimatedProps_1 = require('./AnimatedProps')
exports.createAnimatedComponent = function(Component) {
  return react_1.forwardRef(function(props, ref) {
    var node = react_1.useRef(null)
    var mounted = react_1.useRef(true)
    var propsAnimated = react_1.useRef(null)
    var forceUpdate = shared_1.useForceUpdate()
    var attachProps = react_1.useCallback(function(props) {
      var oldPropsAnimated = propsAnimated.current
      var callback = function() {
        if (node.current) {
          var didUpdate = globals_1.applyAnimatedValues(
            node.current,
            propsAnimated.current.getAnimatedValue()
          )
          if (didUpdate === false) forceUpdate()
        }
      }
      propsAnimated.current = new AnimatedProps_1.AnimatedProps(props, callback)
      oldPropsAnimated && oldPropsAnimated.detach()
      return propsAnimated.current.getValue()
    }, [])
    react_1.useEffect(function() {
      return function() {
        mounted.current = false
        propsAnimated.current && propsAnimated.current.detach()
      }
    }, [])
    react_1.useImperativeHandle(ref, function() {
      return globals_1.createAnimatedRef(node, mounted, forceUpdate)
    })
    // TODO: Avoid special case for scrollTop/scrollLeft
    var _a = attachProps(props),
      scrollTop = _a.scrollTop,
      scrollLeft = _a.scrollLeft,
      animatedProps = tslib_1.__rest(_a, ['scrollTop', 'scrollLeft'])
    return react_1.default.createElement(
      Component,
      tslib_1.__assign({}, animatedProps, {
        ref: function(childRef) {
          return (node.current = handleRef(childRef, ref))
        },
      })
    )
  })
}
/** Add an `extend` method to your `animated` factory function */
function withExtend(animated, options) {
  if (options === void 0) {
    options = {}
  }
  var self = animated
  var extend = function(arg, overrideKey) {
    // Arrays avoid passing their index to `extend`
    if (shared_1.is.arr(arg)) {
      return arg.forEach(function(arg) {
        return extend(arg)
      })
    }
    // Object keys are always used over value inspection
    if (shared_1.is.obj(arg)) {
      for (var key_1 in arg) extend(arg[key_1], key_1)
      return
    }
    // Use the `overrideKey` or inspect the value for a key
    var key = shared_1.is.str(overrideKey)
      ? overrideKey
      : shared_1.is.str(arg)
      ? arg
      : arg && shared_1.is.str(arg.displayName)
      ? arg.displayName
      : shared_1.is.fun(arg)
      ? arg.name
      : ''
    // This lowercases the first letter of the key
    if (options.lowercase) {
      key = key[0].toLowerCase() + key.slice(1)
    }
    // NOTE(typescript): Properties are not yet inferred from the arguments of
    // the `extend` method and then attached to the `animated` function via
    // the return type.
    self[key] = animated(arg)
  }
  self.extend = function() {
    var args = []
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i]
    }
    args.forEach(function(arg) {
      return extend(arg)
    })
    return self
  }
  return self
}
exports.withExtend = withExtend
function handleRef(ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (shared_1.is.fun(forward)) forward(ref)
    else if (shared_1.is.obj(forward)) {
      // If it's an object and has a 'current' property, assume it's a ref object
      forward.current = ref
    }
  }
  return ref
}
