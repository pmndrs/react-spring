'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'))
var _assertThisInitialized = _interopDefault(
  require('@babel/runtime/helpers/assertThisInitialized')
)
var _inheritsLoose = _interopDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)
var _objectWithoutPropertiesLoose = _interopDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var React = require('react')
var React__default = _interopDefault(React)

var bugfixes = undefined
var applyAnimatedValues = undefined
var colorNames = []
var requestFrame = function requestFrame(cb) {
  return typeof window !== 'undefined' && window.requestAnimationFrame(cb)
}
var cancelFrame = function cancelFrame(cb) {
  return typeof window !== 'undefined' && window.cancelAnimationFrame(cb)
}
var interpolation = undefined
var now = function now() {
  return Date.now()
}
var defaultElement = undefined
var createAnimatedStyle = undefined
var injectApplyAnimatedValues = function injectApplyAnimatedValues(
  fn,
  transform
) {
  return (applyAnimatedValues = {
    fn: fn,
    transform: transform,
  })
}
var injectColorNames = function injectColorNames(names) {
  return (colorNames = names)
}
var injectBugfixes = function injectBugfixes(fn) {
  return (bugfixes = fn)
}
var injectInterpolation = function injectInterpolation(cls) {
  return (interpolation = cls)
}
var injectFrame = function injectFrame(raf, caf) {
  var _ref

  return (
    (_ref = [raf, caf]), (requestFrame = _ref[0]), (cancelFrame = _ref[1]), _ref
  )
}
var injectNow = function injectNow(nowFn) {
  return (now = nowFn)
}
var injectDefaultElement = function injectDefaultElement(el) {
  return (defaultElement = el)
}
var injectCreateAnimatedStyle = function injectCreateAnimatedStyle(factory) {
  return (createAnimatedStyle = factory)
}

var Globals = /*#__PURE__*/ Object.freeze({
  get bugfixes() {
    return bugfixes
  },
  get applyAnimatedValues() {
    return applyAnimatedValues
  },
  get colorNames() {
    return colorNames
  },
  get requestFrame() {
    return requestFrame
  },
  get cancelFrame() {
    return cancelFrame
  },
  get interpolation() {
    return interpolation
  },
  get now() {
    return now
  },
  get defaultElement() {
    return defaultElement
  },
  get createAnimatedStyle() {
    return createAnimatedStyle
  },
  injectApplyAnimatedValues: injectApplyAnimatedValues,
  injectColorNames: injectColorNames,
  injectBugfixes: injectBugfixes,
  injectInterpolation: injectInterpolation,
  injectFrame: injectFrame,
  injectNow: injectNow,
  injectDefaultElement: injectDefaultElement,
  injectCreateAnimatedStyle: injectCreateAnimatedStyle,
})

var Animated =
  /*#__PURE__*/
  (function() {
    function Animated() {}

    var _proto = Animated.prototype

    _proto.attach = function attach() {}

    _proto.detach = function detach() {}

    _proto.getValue = function getValue() {}

    _proto.getAnimatedValue = function getAnimatedValue() {
      return this.getValue()
    }

    _proto.addChild = function addChild(child) {}

    _proto.removeChild = function removeChild(child) {}

    _proto.getChildren = function getChildren() {
      return []
    }

    return Animated
  })()

var getValues = function getValues(object) {
  return Object.keys(object).map(function(k) {
    return object[k]
  })
}

var AnimatedWithChildren =
  /*#__PURE__*/
  (function(_Animated) {
    _inheritsLoose(AnimatedWithChildren, _Animated)

    function AnimatedWithChildren() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this = _Animated.call.apply(_Animated, [this].concat(args)) || this
      _this.children = []

      _this.getChildren = function() {
        return _this.children
      }

      _this.getPayload = function(index) {
        if (index === void 0) {
          index = undefined
        }

        return index !== void 0 && _this.payload
          ? _this.payload[index]
          : _this.payload || _assertThisInitialized(_this)
      }

      return _this
    }

    var _proto = AnimatedWithChildren.prototype

    _proto.addChild = function addChild(child) {
      if (this.children.length === 0) this.attach()
      this.children.push(child)
    }

    _proto.removeChild = function removeChild(child) {
      var index = this.children.indexOf(child)
      this.children.splice(index, 1)
      if (this.children.length === 0) this.detach()
    }

    return AnimatedWithChildren
  })(Animated)
var AnimatedArrayWithChildren =
  /*#__PURE__*/
  (function(_AnimatedWithChildren) {
    _inheritsLoose(AnimatedArrayWithChildren, _AnimatedWithChildren)

    function AnimatedArrayWithChildren() {
      var _this2

      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2]
      }

      _this2 =
        _AnimatedWithChildren.call.apply(
          _AnimatedWithChildren,
          [this].concat(args)
        ) || this
      _this2.payload = []

      _this2.getAnimatedValue = function() {
        return _this2.getValue()
      }

      _this2.attach = function() {
        return _this2.payload.forEach(function(p) {
          return (
            p instanceof Animated && p.addChild(_assertThisInitialized(_this2))
          )
        })
      }

      _this2.detach = function() {
        return _this2.payload.forEach(function(p) {
          return (
            p instanceof Animated &&
            p.removeChild(_assertThisInitialized(_this2))
          )
        })
      }

      return _this2
    }

    return AnimatedArrayWithChildren
  })(AnimatedWithChildren)
var AnimatedObjectWithChildren =
  /*#__PURE__*/
  (function(_AnimatedWithChildren2) {
    _inheritsLoose(AnimatedObjectWithChildren, _AnimatedWithChildren2)

    function AnimatedObjectWithChildren() {
      var _this3

      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }

      _this3 =
        _AnimatedWithChildren2.call.apply(
          _AnimatedWithChildren2,
          [this].concat(args)
        ) || this
      _this3.payload = {}

      _this3.getAnimatedValue = function() {
        return _this3.getValue(true)
      }

      _this3.attach = function() {
        return getValues(_this3.payload).forEach(function(s) {
          return (
            s instanceof Animated && s.addChild(_assertThisInitialized(_this3))
          )
        })
      }

      _this3.detach = function() {
        return getValues(_this3.payload).forEach(function(s) {
          return (
            s instanceof Animated &&
            s.removeChild(_assertThisInitialized(_this3))
          )
        })
      }

      return _this3
    }

    var _proto2 = AnimatedObjectWithChildren.prototype

    _proto2.getValue = function getValue(animated) {
      if (animated === void 0) {
        animated = false
      }

      var payload = {}

      for (var key in this.payload) {
        var value = this.payload[key]
        if (animated && !(value instanceof Animated)) continue
        payload[key] =
          value instanceof Animated
            ? value[animated ? 'getAnimatedValue' : 'getValue']()
            : value
      }

      return payload
    }

    return AnimatedObjectWithChildren
  })(AnimatedWithChildren)

var Interpolation =
  /*#__PURE__*/
  (function() {
    function Interpolation() {}

    // Default config = config, args
    // Short config   = range, output, extrapolate
    Interpolation.create = function create(config, output, extra) {
      if (typeof config === 'function') return config
      else if (
        interpolation &&
        config.output &&
        typeof config.output[0] === 'string'
      )
        return interpolation(config)
      else if (Array.isArray(config))
        return Interpolation.create({
          range: config,
          output: output,
          extrapolate: extra || 'extend',
        })
      var outputRange = config.output
      var inputRange = config.range || [0, 1]

      var easing =
        config.easing ||
        function(t) {
          return t
        }

      var extrapolateLeft = 'extend'
      var map = config.map
      if (config.extrapolateLeft !== undefined)
        extrapolateLeft = config.extrapolateLeft
      else if (config.extrapolate !== undefined)
        extrapolateLeft = config.extrapolate
      var extrapolateRight = 'extend'
      if (config.extrapolateRight !== undefined)
        extrapolateRight = config.extrapolateRight
      else if (config.extrapolate !== undefined)
        extrapolateRight = config.extrapolate
      return function(input) {
        var range = findRange(input, inputRange)
        return interpolate(
          input,
          inputRange[range],
          inputRange[range + 1],
          outputRange[range],
          outputRange[range + 1],
          easing,
          extrapolateLeft,
          extrapolateRight,
          map
        )
      }
    }

    return Interpolation
  })()

function interpolate(
  input,
  inputMin,
  inputMax,
  outputMin,
  outputMax,
  easing,
  extrapolateLeft,
  extrapolateRight,
  map
) {
  var result = map ? map(input) : input // Extrapolate

  if (result < inputMin) {
    if (extrapolateLeft === 'identity') return result
    else if (extrapolateLeft === 'clamp') result = inputMin
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') return result
    else if (extrapolateRight === 'clamp') result = inputMax
  }

  if (outputMin === outputMax) return outputMin
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax // Input Range

  if (inputMin === -Infinity) result = -result
  else if (inputMax === Infinity) result = result - inputMin
  else result = (result - inputMin) / (inputMax - inputMin) // Easing

  result = easing(result) // Output Range

  if (outputMin === -Infinity) result = -result
  else if (outputMax === Infinity) result = result + outputMin
  else result = result * (outputMax - outputMin) + outputMin
  return result
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i) {
    if (inputRange[i] >= input) break
  }

  return i - 1
}

var AnimatedInterpolation =
  /*#__PURE__*/
  (function(_AnimatedArrayWithChi) {
    _inheritsLoose(AnimatedInterpolation, _AnimatedArrayWithChi)

    function AnimatedInterpolation(parents, _config, _arg) {
      var _this

      _this = _AnimatedArrayWithChi.call(this) || this

      _this.getValue = function() {
        var _this2

        return (_this2 = _this).calc.apply(
          _this2,
          _this.payload.map(function(value) {
            return value.getValue()
          })
        )
      }

      _this.updateConfig = function(config, arg) {
        return (_this.calc = Interpolation.create(config, arg))
      }

      _this.interpolate = function(config, arg) {
        return new AnimatedInterpolation(
          _assertThisInitialized(_this),
          config,
          arg
        )
      }

      _this.payload = // AnimatedArrays should unfold, except AnimatedInterpolation which is taken as is
        parents instanceof AnimatedArrayWithChildren && !parents.updateConfig
          ? parents.payload
          : Array.isArray(parents)
          ? parents
          : [parents]
      _this.calc = Interpolation.create(_config, _arg)
      return _this
    }

    return AnimatedInterpolation
  })(AnimatedArrayWithChildren)
var interpolate$1 = function interpolate(parents, config, arg) {
  return parents && new AnimatedInterpolation(parents, config, arg)
}

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
 * When an Animated.Value is updated, we recursively go down through this
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */

function findAnimatedStyles(node, styles) {
  if (typeof node.update === 'function') styles.add(node)
  else
    node.getChildren().forEach(function(child) {
      return findAnimatedStyles(child, styles)
    })
}
/**
 * Standard value for driving animations.  One `Animated.Value` can drive
 * multiple properties in a synchronized fashion, but can only be driven by one
 * mechanism at a time.  Using a new mechanism (e.g. starting a new animation,
 * or calling `setValue`) will stop any previous ones.
 */

var AnimatedValue =
  /*#__PURE__*/
  (function(_AnimatedWithChildren) {
    _inheritsLoose(AnimatedValue, _AnimatedWithChildren)

    function AnimatedValue(_value) {
      var _this

      _this = _AnimatedWithChildren.call(this) || this

      _this.setValue = function(value, flush) {
        if (flush === void 0) {
          flush = true
        }

        _this.value = value
        if (flush) _this.flush()
      }

      _this.getValue = function() {
        return _this.value
      }

      _this.updateStyles = function() {
        return findAnimatedStyles(
          _assertThisInitialized(_this),
          _this.animatedStyles
        )
      }

      _this.updateValue = function(value) {
        return _this.flush((_this.value = value))
      }

      _this.interpolate = function(config, arg) {
        return new AnimatedInterpolation(
          _assertThisInitialized(_this),
          config,
          arg
        )
      }

      _this.value = _value
      _this.animatedStyles = new Set()
      _this.done = false
      _this.startPosition = _value
      _this.lastPosition = _value
      _this.lastVelocity = undefined
      _this.lastTime = undefined
      _this.controller = undefined
      return _this
    }

    var _proto = AnimatedValue.prototype

    _proto.flush = function flush() {
      if (this.animatedStyles.size === 0) this.updateStyles()
      this.animatedStyles.forEach(function(animatedStyle) {
        return animatedStyle.update()
      })
    }

    _proto.prepare = function prepare(controller) {
      // Values stay loyal to their original controller, this is also a way to
      // detect trailing values originating from a foreign controller
      if (this.controller === undefined) this.controller = controller

      if (this.controller === controller) {
        this.startPosition = this.value
        this.lastPosition = this.value
        this.lastVelocity = controller.isActive ? this.lastVelocity : undefined
        this.lastTime = controller.isActive ? this.lastTime : undefined
        this.done = false
        this.animatedStyles.clear()
      }
    }

    return AnimatedValue
  })(AnimatedWithChildren)

var AnimatedArray =
  /*#__PURE__*/
  (function(_AnimatedArrayWithChi) {
    _inheritsLoose(AnimatedArray, _AnimatedArrayWithChi)

    function AnimatedArray(array) {
      var _this

      _this = _AnimatedArrayWithChi.call(this) || this

      _this.setValue = function(value, flush) {
        if (flush === void 0) {
          flush = true
        }

        if (Array.isArray(value)) {
          if (value.length === _this.payload.length)
            value.forEach(function(v, i) {
              return _this.payload[i].setValue(v, flush)
            })
        } else
          _this.payload.forEach(function(v, i) {
            return _this.payload[i].setValue(value, flush)
          })
      }

      _this.getValue = function() {
        return _this.payload.map(function(v) {
          return v.getValue()
        })
      }

      _this.interpolate = function(config, arg) {
        return new AnimatedInterpolation(
          _assertThisInitialized(_this),
          config,
          arg
        )
      }

      _this.payload = array.map(function(n) {
        return new AnimatedValue(n)
      })
      return _this
    }

    return AnimatedArray
  })(AnimatedArrayWithChildren)

var active = false
var controllers = new Set()

var frameLoop = function frameLoop() {
  var time = now()

  for (
    var _iterator = controllers,
      _isArray = Array.isArray(_iterator),
      _i = 0,
      _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();
    ;

  ) {
    var _ref

    if (_isArray) {
      if (_i >= _iterator.length) break
      _ref = _iterator[_i++]
    } else {
      _i = _iterator.next()
      if (_i.done) break
      _ref = _i.value
    }

    var controller = _ref
    var isDone = true
    var noChange = true

    for (
      var configIdx = 0;
      configIdx < controller.configs.length;
      configIdx++
    ) {
      var config = controller.configs[configIdx]
      var endOfAnimation = void 0,
        lastTime = void 0

      for (var valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        var animation = config.animatedValues[valIdx] // If an animation is done, skip, until all of them conclude

        if (animation.done) continue
        var from = config.fromValues[valIdx]
        var to = config.toValues[valIdx]
        var position = animation.lastPosition
        var isAnimated = to instanceof Animated

        var _velocity = Array.isArray(config.initialVelocity)
          ? config.initialVelocity[valIdx]
          : config.initialVelocity

        if (isAnimated) to = to.getValue() // Conclude animation if it's either immediate, or from-values match end-state

        if (config.immediate || (!isAnimated && !config.decay && from === to)) {
          animation.updateValue(to)
          animation.done = true
          continue
        } // Doing delay here instead of setTimeout is one async worry less

        if (config.delay && time - controller.startTime < config.delay) {
          isDone = false
          continue
        } // Flag change

        noChange = false // Break animation when string values are involved

        if (typeof from === 'string' || typeof to === 'string') {
          animation.updateValue(to)
          animation.done = true
          continue
        }

        if (config.duration !== void 0) {
          /** Duration easing */
          position =
            from +
            config.easing(
              (time - controller.startTime - config.delay) / config.duration
            ) *
              (to - from)
          endOfAnimation =
            time >= controller.startTime + config.delay + config.duration
        } else if (config.decay) {
          /** Decay easing */
          position =
            from +
            (_velocity / (1 - 0.998)) *
              (1 - Math.exp(-(1 - 0.998) * (time - controller.startTime)))
          endOfAnimation = Math.abs(animation.lastPosition - position) < 0.1
          if (endOfAnimation) to = position
        } else {
          /** Spring easing */
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : time
          _velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
              : config.initialVelocity // If we lost a lot of frames just jump to the end.

          if (time > lastTime + 64) lastTime = time // http://gafferongames.com/game-physics/fix-your-timestep/

          var numSteps = Math.floor(time - lastTime)

          for (var i = 0; i < numSteps; ++i) {
            var force = -config.tension * (position - to)
            var damping = -config.friction * _velocity
            var acceleration = (force + damping) / config.mass
            _velocity = _velocity + (acceleration * 1) / 1000
            position = position + (_velocity * 1) / 1000
          } // Conditions for stopping the spring animation

          var isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          var isVelocity = Math.abs(_velocity) <= config.precision
          var isDisplacement =
            config.tension !== 0
              ? Math.abs(to - position) <= config.precision
              : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)
          animation.lastVelocity = _velocity
          animation.lastTime = time
        } // Trails aren't done until their parents conclude

        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to
          animation.done = true
        } else isDone = false

        animation.updateValue(position)
        animation.lastPosition = position
      } // Keep track of updated values only when necessary

      if (controller.props.onFrame || !controller.props.native)
        controller.animatedProps[config.name] = config.interpolation.getValue()
    } // Update callbacks in the end of the frame

    if (controller.props.onFrame || !controller.props.native) {
      if (!controller.props.native && controller.onUpdate) controller.onUpdate()
      if (controller.props.onFrame)
        controller.props.onFrame(controller.animatedProps)
    } // Either call onEnd or next frame

    if (isDone) {
      controllers.delete(controller)
      controller.debouncedOnEnd({
        finished: true,
        noChange: noChange,
      })
    }
  } // Loop over as long as there are controllers ...

  if (controllers.size) requestFrame(frameLoop)
  else active = false
}

var addController = function addController(controller) {
  if (!controllers.has(controller)) {
    controllers.add(controller)
    if (!active) requestFrame(frameLoop)
    active = true
  }
}

var removeController = function removeController(controller) {
  if (controllers.has(controller)) {
    controllers.delete(controller)
  }
}

function withDefault(value, defaultValue) {
  return value === undefined || value === null ? defaultValue : value
}
function toArray(a) {
  return a !== void 0 ? (Array.isArray(a) ? a : [a]) : []
}
function shallowEqual(a, b) {
  if (typeof a !== typeof b) return false
  if (typeof a === 'string' || typeof a === 'number') return a === b
  var i

  for (i in a) {
    if (!(i in b)) return false
  }

  for (i in b) {
    if (a[i] !== b[i]) return false
  }

  return i === void 0 ? a === b : true
}
function callProp(obj) {
  for (
    var _len = arguments.length,
      args = new Array(_len > 1 ? _len - 1 : 0),
      _key = 1;
    _key < _len;
    _key++
  ) {
    args[_key - 1] = arguments[_key]
  }

  return typeof obj === 'function' ? obj.apply(void 0, args) : obj
}
function getValues$1(object) {
  return Object.keys(object).map(function(k) {
    return object[k]
  })
}
function getForwardProps(props) {
  var to = props.to,
    from = props.from,
    config = props.config,
    native = props.native,
    onStart = props.onStart,
    onRest = props.onRest,
    onFrame = props.onFrame,
    children = props.children,
    reset = props.reset,
    reverse = props.reverse,
    force = props.force,
    immediate = props.immediate,
    impl = props.impl,
    inject = props.inject,
    delay = props.delay,
    attach = props.attach,
    destroyed = props.destroyed,
    interpolateTo = props.interpolateTo,
    autoStart = props.autoStart,
    ref = props.ref,
    forward = _objectWithoutPropertiesLoose(props, [
      'to',
      'from',
      'config',
      'native',
      'onStart',
      'onRest',
      'onFrame',
      'children',
      'reset',
      'reverse',
      'force',
      'immediate',
      'impl',
      'inject',
      'delay',
      'attach',
      'destroyed',
      'interpolateTo',
      'autoStart',
      'ref',
    ])

  return forward
}
function interpolateTo(props) {
  var forward = getForwardProps(props)
  var rest = Object.keys(props).reduce(function(a, k) {
    var _extends2

    return forward[k] !== void 0
      ? a
      : _extends(
          {},
          a,
          ((_extends2 = {}), (_extends2[k] = props[k]), _extends2)
        )
  }, {})
  return _extends(
    {
      to: forward,
    },
    rest
  )
}
function convertToAnimatedValue(acc, _ref) {
  var _extends3

  var name = _ref[0],
    value = _ref[1]
  return _extends(
    {},
    acc,
    ((_extends3 = {}),
    (_extends3[name] = new (Array.isArray(value)
      ? AnimatedArray
      : AnimatedValue)(value)),
    _extends3)
  )
}
function convertValues(props) {
  var from = props.from,
    to = props.to,
    native = props.native
  var allProps = Object.entries(_extends({}, from, to))
  return native
    ? allProps.reduce(convertToAnimatedValue, {})
    : _extends({}, from, to)
}
function handleRef(ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (typeof forward === 'function') forward(ref)
    else if (typeof forward === 'object') {
      // If it's an object and has a 'current' property, assume it's a ref object
      forward.current = ref
    }
  }

  return ref
}

var Controller =
  /*#__PURE__*/
  (function() {
    function Controller(props, config) {
      var _this = this

      if (config === void 0) {
        config = {
          native: true,
          interpolateTo: true,
          autoStart: true,
        }
      }

      this.getValues = function() {
        return _this.props.native ? _this.interpolations : _this.animatedProps
      }

      this.dependents = new Set()
      this.isActive = false
      this.hasChanged = false
      this.props = {}
      this.merged = {}
      this.animations = {}
      this.interpolations = {}
      this.animatedProps = {}
      this.configs = []
      this.frame = undefined
      this.startTime = undefined
      this.lastTime = undefined
      this.update(_extends({}, props, config))
    }

    var _proto = Controller.prototype

    _proto.update = function update(props) {
      var _this2 = this

      this.props = _extends({}, this.props, props)

      var _ref = this.props.interpolateTo
          ? interpolateTo(this.props)
          : this.props,
        _ref$from = _ref.from,
        from = _ref$from === void 0 ? {} : _ref$from,
        _ref$to = _ref.to,
        to = _ref$to === void 0 ? {} : _ref$to,
        _ref$config = _ref.config,
        config = _ref$config === void 0 ? {} : _ref$config,
        _ref$delay = _ref.delay,
        delay = _ref$delay === void 0 ? 0 : _ref$delay,
        reverse = _ref.reverse,
        attach = _ref.attach,
        reset = _ref.reset,
        immediate = _ref.immediate,
        autoStart = _ref.autoStart,
        ref = _ref.ref // Reverse values when requested

      if (reverse) {
        var _ref2 = [to, from]
        from = _ref2[0]
        to = _ref2[1]
      }

      this.hasChanged = false // Attachment handling, trailed springs can "attach" themselves to a previous spring

      var target = attach && attach(this) // Reset merged props when necessary

      var extra = reset ? {} : this.merged // This will collect all props that were ever set

      this.merged = _extends({}, from, extra, to) // Reduces input { name: value } pairs into animated values

      this.animations = Object.entries(this.merged).reduce(function(
        acc,
        _ref3,
        i
      ) {
        var name = _ref3[0],
          value = _ref3[1]
        // Issue cached entries, except on reset
        var entry = (!reset && acc[name]) || {} // Figure out what the value is supposed to be

        var isNumber = typeof value === 'number'
        var isString =
          typeof value === 'string' &&
          !value.startsWith('#') &&
          !/\d/.test(value) &&
          !colorNames[value]
        var isArray = !isNumber && !isString && Array.isArray(value)
        var fromValue = from[name] !== undefined ? from[name] : value
        var toValue = isNumber || isArray ? value : isString ? value : 1
        var toConfig = callProp(config, name)
        if (target) toValue = target.animations[name].parent // Detect changes, animated values will be checked in the raf-loop

        if (toConfig.decay !== void 0 || !shallowEqual(entry.changes, value)) {
          var _extends2

          _this2.hasChanged = true
          var parent, interpolation$$1
          if (isNumber || isString)
            parent = interpolation$$1 =
              entry.parent || new AnimatedValue(fromValue)
          else if (isArray)
            parent = interpolation$$1 =
              entry.parent || new AnimatedArray(fromValue)
          else {
            var prev =
              entry.interpolation &&
              entry.interpolation.calc(entry.parent.value)

            if (entry.parent) {
              parent = entry.parent
              parent.setValue(0, false)
            } else parent = new AnimatedValue(0)

            var range = {
              output: [prev !== void 0 ? prev : fromValue, value],
            }

            if (entry.interpolation) {
              interpolation$$1 = entry.interpolation
              entry.interpolation.updateConfig(range)
            } else interpolation$$1 = parent.interpolate(range)
          } // Set immediate values

          if (callProp(immediate, name)) parent.setValue(value, false) // Reset animated values

          var animatedValues = toArray(parent.getPayload())
          animatedValues.forEach(function(value) {
            return value.prepare(_this2)
          })
          return _extends(
            {},
            acc,
            ((_extends2 = {}),
            (_extends2[name] = _extends({}, entry, {
              name: name,
              parent: parent,
              interpolation: interpolation$$1,
              animatedValues: animatedValues,
              changes: value,
              fromValues: toArray(parent.getValue()),
              toValues: toArray(target ? toValue.getPayload() : toValue),
              immediate: callProp(immediate, name),
              delay: withDefault(toConfig.delay, delay || 0),
              initialVelocity: withDefault(toConfig.velocity, 0),
              clamp: withDefault(toConfig.clamp, false),
              precision: withDefault(toConfig.precision, 0.01),
              tension: withDefault(toConfig.tension, 170),
              friction: withDefault(toConfig.friction, 26),
              mass: withDefault(toConfig.mass, 1),
              duration: toConfig.duration,
              easing: withDefault(toConfig.easing, function(t) {
                return t
              }),
              decay: toConfig.decay,
            })),
            _extends2)
          )
        } else return acc
      },
      this.animations)

      if (this.hasChanged) {
        this.configs = getValues$1(this.animations)
        this.animatedProps = {}
        this.interpolations = {}

        for (var key in this.animations) {
          this.interpolations[key] = this.animations[key].interpolation
          this.animatedProps[key] = this.animations[
            key
          ].interpolation.getValue()
        }
      } // TODO: clean up ref in controller

      for (
        var _len = arguments.length,
          start = new Array(_len > 1 ? _len - 1 : 0),
          _key = 1;
        _key < _len;
        _key++
      ) {
        start[_key - 1] = arguments[_key]
      }

      if (!ref && (autoStart || start.length)) this.start.apply(this, start)
      var onEnd = start[0],
        onUpdate = start[1]
      this.onEnd = typeof onEnd === 'function' && onEnd
      this.onUpdate = onUpdate
      return this.getValues()
    }

    _proto.start = function start(onEnd, onUpdate) {
      var _this3 = this

      this.startTime = now()
      if (this.isActive) this.stop()
      this.isActive = true
      this.onEnd = typeof onEnd === 'function' && onEnd
      this.onUpdate = onUpdate
      if (this.props.onStart) this.props.onStart()
      addController(this)
      return new Promise(function(res) {
        return (_this3.resolve = res)
      })
    }

    _proto.stop = function stop(finished) {
      if (finished === void 0) {
        finished = false
      }

      // Reset collected changes since the animation has been stopped cold turkey
      if (finished)
        getValues$1(this.animations).forEach(function(a) {
          return (a.changes = undefined)
        })
      this.debouncedOnEnd({
        finished: finished,
      })
    }

    _proto.destroy = function destroy() {
      removeController(this)
      this.props = {}
      this.merged = {}
      this.animations = {}
      this.interpolations = {}
      this.animatedProps = {}
      this.configs = []
    }

    _proto.debouncedOnEnd = function debouncedOnEnd(result) {
      removeController(this)
      this.isActive = false
      var onEnd = this.onEnd
      this.onEnd = null
      if (onEnd) onEnd(result)
      if (this.resolve) this.resolve()
      this.resolve = null
    }

    return Controller
  })()

var AnimatedProps =
  /*#__PURE__*/
  (function(_AnimatedObjectWithCh) {
    _inheritsLoose(AnimatedProps, _AnimatedObjectWithCh)

    function AnimatedProps(props, callback) {
      var _this

      _this = _AnimatedObjectWithCh.call(this) || this
      if (props.style)
        props = _extends({}, props, {
          style: createAnimatedStyle(props.style),
        })
      _this.payload = props
      _this.update = callback

      _this.attach()

      return _this
    }

    return AnimatedProps
  })(AnimatedObjectWithChildren)

function createAnimatedComponent(Component) {
  var AnimatedComponent =
    /*#__PURE__*/
    (function(_React$Component) {
      _inheritsLoose(AnimatedComponent, _React$Component)

      function AnimatedComponent(props) {
        var _this

        _this = _React$Component.call(this) || this

        _this.callback = function() {
          if (_this.node) {
            var didUpdate = applyAnimatedValues.fn(
              _this.node,
              _this.propsAnimated.getAnimatedValue(),
              _assertThisInitialized(_this)
            )
            if (didUpdate === false) _this.forceUpdate()
          }
        }

        _this.attachProps(props)

        return _this
      }

      var _proto = AnimatedComponent.prototype

      _proto.componentWillUnmount = function componentWillUnmount() {
        this.propsAnimated && this.propsAnimated.detach()
      }

      _proto.setNativeProps = function setNativeProps(props) {
        var didUpdate = applyAnimatedValues.fn(this.node, props, this)
        if (didUpdate === false) this.forceUpdate()
      } // The system is best designed when setNativeProps is implemented. It is
      // able to avoid re-rendering and directly set the attributes that
      // changed. However, setNativeProps can only be implemented on leaf
      // native components. If you want to animate a composite component, you
      // need to re-render it. In this case, we have a fallback that uses
      // forceUpdate.

      _proto.attachProps = function attachProps(_ref) {
        var forwardRef = _ref.forwardRef,
          nextProps = _objectWithoutPropertiesLoose(_ref, ['forwardRef'])

        var oldPropsAnimated = this.propsAnimated
        this.propsAnimated = new AnimatedProps(nextProps, this.callback) // When you call detach, it removes the element from the parent list
        // of children. If it goes to 0, then the parent also detaches itself
        // and so on.
        // An optimization is to attach the new elements and THEN detach the old
        // ones instead of detaching and THEN attaching.
        // This way the intermediate state isn't to go to 0 and trigger
        // this expensive recursive detaching to then re-attach everything on
        // the very next operation.

        oldPropsAnimated && oldPropsAnimated.detach()
      }

      _proto.shouldComponentUpdate = function shouldComponentUpdate(props) {
        var style = props.style,
          nextProps = _objectWithoutPropertiesLoose(props, ['style'])

        var _this$props = this.props,
          currentStyle = _this$props.style,
          currentProps = _objectWithoutPropertiesLoose(_this$props, ['style'])

        if (
          !shallowEqual(currentProps, nextProps) ||
          !shallowEqual(currentStyle, style)
        ) {
          this.attachProps(props)
          return true
        }

        return false
      }

      _proto.render = function render() {
        var _this2 = this

        var _this$propsAnimated$g = this.propsAnimated.getValue(),
          scrollTop = _this$propsAnimated$g.scrollTop,
          scrollLeft = _this$propsAnimated$g.scrollLeft,
          animatedProps = _objectWithoutPropertiesLoose(_this$propsAnimated$g, [
            'scrollTop',
            'scrollLeft',
          ])

        return React__default.createElement(
          Component,
          _extends({}, animatedProps, {
            ref: function ref(node) {
              return (_this2.node = handleRef(node, _this2.props.forwardRef))
            },
          })
        )
      }

      return AnimatedComponent
    })(React__default.Component)

  return React__default.forwardRef(function(props, ref) {
    return React__default.createElement(
      AnimatedComponent,
      _extends({}, props, {
        forwardRef: ref,
      })
    )
  })
}

// http://www.w3.org/TR/css3-color/#svg-color
var colors = {
  transparent: 0x00000000,
  aliceblue: 0xf0f8ffff,
  antiquewhite: 0xfaebd7ff,
  aqua: 0x00ffffff,
  aquamarine: 0x7fffd4ff,
  azure: 0xf0ffffff,
  beige: 0xf5f5dcff,
  bisque: 0xffe4c4ff,
  black: 0x000000ff,
  blanchedalmond: 0xffebcdff,
  blue: 0x0000ffff,
  blueviolet: 0x8a2be2ff,
  brown: 0xa52a2aff,
  burlywood: 0xdeb887ff,
  burntsienna: 0xea7e5dff,
  cadetblue: 0x5f9ea0ff,
  chartreuse: 0x7fff00ff,
  chocolate: 0xd2691eff,
  coral: 0xff7f50ff,
  cornflowerblue: 0x6495edff,
  cornsilk: 0xfff8dcff,
  crimson: 0xdc143cff,
  cyan: 0x00ffffff,
  darkblue: 0x00008bff,
  darkcyan: 0x008b8bff,
  darkgoldenrod: 0xb8860bff,
  darkgray: 0xa9a9a9ff,
  darkgreen: 0x006400ff,
  darkgrey: 0xa9a9a9ff,
  darkkhaki: 0xbdb76bff,
  darkmagenta: 0x8b008bff,
  darkolivegreen: 0x556b2fff,
  darkorange: 0xff8c00ff,
  darkorchid: 0x9932ccff,
  darkred: 0x8b0000ff,
  darksalmon: 0xe9967aff,
  darkseagreen: 0x8fbc8fff,
  darkslateblue: 0x483d8bff,
  darkslategray: 0x2f4f4fff,
  darkslategrey: 0x2f4f4fff,
  darkturquoise: 0x00ced1ff,
  darkviolet: 0x9400d3ff,
  deeppink: 0xff1493ff,
  deepskyblue: 0x00bfffff,
  dimgray: 0x696969ff,
  dimgrey: 0x696969ff,
  dodgerblue: 0x1e90ffff,
  firebrick: 0xb22222ff,
  floralwhite: 0xfffaf0ff,
  forestgreen: 0x228b22ff,
  fuchsia: 0xff00ffff,
  gainsboro: 0xdcdcdcff,
  ghostwhite: 0xf8f8ffff,
  gold: 0xffd700ff,
  goldenrod: 0xdaa520ff,
  gray: 0x808080ff,
  green: 0x008000ff,
  greenyellow: 0xadff2fff,
  grey: 0x808080ff,
  honeydew: 0xf0fff0ff,
  hotpink: 0xff69b4ff,
  indianred: 0xcd5c5cff,
  indigo: 0x4b0082ff,
  ivory: 0xfffff0ff,
  khaki: 0xf0e68cff,
  lavender: 0xe6e6faff,
  lavenderblush: 0xfff0f5ff,
  lawngreen: 0x7cfc00ff,
  lemonchiffon: 0xfffacdff,
  lightblue: 0xadd8e6ff,
  lightcoral: 0xf08080ff,
  lightcyan: 0xe0ffffff,
  lightgoldenrodyellow: 0xfafad2ff,
  lightgray: 0xd3d3d3ff,
  lightgreen: 0x90ee90ff,
  lightgrey: 0xd3d3d3ff,
  lightpink: 0xffb6c1ff,
  lightsalmon: 0xffa07aff,
  lightseagreen: 0x20b2aaff,
  lightskyblue: 0x87cefaff,
  lightslategray: 0x778899ff,
  lightslategrey: 0x778899ff,
  lightsteelblue: 0xb0c4deff,
  lightyellow: 0xffffe0ff,
  lime: 0x00ff00ff,
  limegreen: 0x32cd32ff,
  linen: 0xfaf0e6ff,
  magenta: 0xff00ffff,
  maroon: 0x800000ff,
  mediumaquamarine: 0x66cdaaff,
  mediumblue: 0x0000cdff,
  mediumorchid: 0xba55d3ff,
  mediumpurple: 0x9370dbff,
  mediumseagreen: 0x3cb371ff,
  mediumslateblue: 0x7b68eeff,
  mediumspringgreen: 0x00fa9aff,
  mediumturquoise: 0x48d1ccff,
  mediumvioletred: 0xc71585ff,
  midnightblue: 0x191970ff,
  mintcream: 0xf5fffaff,
  mistyrose: 0xffe4e1ff,
  moccasin: 0xffe4b5ff,
  navajowhite: 0xffdeadff,
  navy: 0x000080ff,
  oldlace: 0xfdf5e6ff,
  olive: 0x808000ff,
  olivedrab: 0x6b8e23ff,
  orange: 0xffa500ff,
  orangered: 0xff4500ff,
  orchid: 0xda70d6ff,
  palegoldenrod: 0xeee8aaff,
  palegreen: 0x98fb98ff,
  paleturquoise: 0xafeeeeff,
  palevioletred: 0xdb7093ff,
  papayawhip: 0xffefd5ff,
  peachpuff: 0xffdab9ff,
  peru: 0xcd853fff,
  pink: 0xffc0cbff,
  plum: 0xdda0ddff,
  powderblue: 0xb0e0e6ff,
  purple: 0x800080ff,
  rebeccapurple: 0x663399ff,
  red: 0xff0000ff,
  rosybrown: 0xbc8f8fff,
  royalblue: 0x4169e1ff,
  saddlebrown: 0x8b4513ff,
  salmon: 0xfa8072ff,
  sandybrown: 0xf4a460ff,
  seagreen: 0x2e8b57ff,
  seashell: 0xfff5eeff,
  sienna: 0xa0522dff,
  silver: 0xc0c0c0ff,
  skyblue: 0x87ceebff,
  slateblue: 0x6a5acdff,
  slategray: 0x708090ff,
  slategrey: 0x708090ff,
  snow: 0xfffafaff,
  springgreen: 0x00ff7fff,
  steelblue: 0x4682b4ff,
  tan: 0xd2b48cff,
  teal: 0x008080ff,
  thistle: 0xd8bfd8ff,
  tomato: 0xff6347ff,
  turquoise: 0x40e0d0ff,
  violet: 0xee82eeff,
  wheat: 0xf5deb3ff,
  white: 0xffffffff,
  whitesmoke: 0xf5f5f5ff,
  yellow: 0xffff00ff,
  yellowgreen: 0x9acd32ff,
}

// const INTEGER = '[-+]?\\d+';
var NUMBER = '[-+]?\\d*\\.?\\d+'
var PERCENTAGE = NUMBER + '%'

function call() {
  return (
    '\\(\\s*(' +
    Array.prototype.slice.call(arguments).join(')\\s*,\\s*(') +
    ')\\s*\\)'
  )
}

var rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER))
var rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER))
var hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE))
var hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER))
var hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
var hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
var hex6 = /^#([0-9a-fA-F]{6})$/
var hex8 = /^#([0-9a-fA-F]{8})$/

/*
https://github.com/react-community/normalize-css-color

BSD 3-Clause License

Copyright (c) 2016, React Community
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function normalizeColor(color) {
  var match

  if (typeof color === 'number') {
    return color >>> 0 === color && color >= 0 && color <= 0xffffffff
      ? color
      : null
  } // Ordered based on occurrences on Facebook codebase

  if ((match = hex6.exec(color))) return parseInt(match[1] + 'ff', 16) >>> 0
  if (colors.hasOwnProperty(color)) return colors[color]

  if ((match = rgb.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = rgba.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        parse1(match[4])) >>> // a
      0
    )
  }

  if ((match = hex3.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          'ff', // a
        16
      ) >>> 0
    )
  } // https://drafts.csswg.org/css-color-4/#hex-notation

  if ((match = hex8.exec(color))) return parseInt(match[1], 16) >>> 0

  if ((match = hex4.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          match[4] +
          match[4], // a
        16
      ) >>> 0
    )
  }

  if ((match = hsl.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = hsla.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        parse1(match[4])) >>> // a
      0
    )
  }

  return null
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function hslToRgb(h, s, l) {
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s
  var p = 2 * l - q
  var r = hue2rgb(p, q, h + 1 / 3)
  var g = hue2rgb(p, q, h)
  var b = hue2rgb(p, q, h - 1 / 3)
  return (
    (Math.round(r * 255) << 24) |
    (Math.round(g * 255) << 16) |
    (Math.round(b * 255) << 8)
  )
}

function parse255(str) {
  var int = parseInt(str, 10)
  if (int < 0) return 0
  if (int > 255) return 255
  return int
}

function parse360(str) {
  var int = parseFloat(str)
  return (((int % 360) + 360) % 360) / 360
}

function parse1(str) {
  var num = parseFloat(str)
  if (num < 0) return 0
  if (num > 1) return 255
  return Math.round(num * 255)
}

function parsePercentage(str) {
  // parseFloat conveniently ignores the final %
  var int = parseFloat(str)
  if (int < 0) return 0
  if (int > 100) return 1
  return int / 100
}

function colorToRgba(input) {
  var int32Color = normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0
  var r = (int32Color & 0xff000000) >>> 24
  var g = (int32Color & 0x00ff0000) >>> 16
  var b = (int32Color & 0x0000ff00) >>> 8
  var a = (int32Color & 0x000000ff) / 255
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
} // Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662

var stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g // Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e

var colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi // Covers color names (transparent, blue, etc.)

var colorNamesRegex = new RegExp('(' + Object.keys(colors).join('|') + ')', 'g')
/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36)           // colors
 *   -45deg                            // values with units
 *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
 */

function createInterpolation(config) {
  // Replace colors with rgba
  var outputRange = config.output
    .map(function(rangeValue) {
      return rangeValue.replace(colorRegex, colorToRgba)
    })
    .map(function(rangeValue) {
      return rangeValue.replace(colorNamesRegex, colorToRgba)
    }) // ->
  // [
  //   [0, 50],
  //   [100, 150],
  //   [200, 250],
  //   [0, 0.5],
  // ]

  var outputRanges = outputRange[0].match(stringShapeRegex).map(function() {
    return []
  })
  outputRange.forEach(function(value) {
    value.match(stringShapeRegex).forEach(function(number, i) {
      return outputRanges[i].push(+number)
    })
  })
  var interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map(function(value, i) {
      return Interpolation.create(
        _extends({}, config, {
          output: outputRanges[i],
        })
      )
    })
  return function(input) {
    var i = 0
    return (
      outputRange[0] // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        .replace(stringShapeRegex, function() {
          return interpolations[i++](input)
        }) // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
        // round the opacity (4th column).
        .replace(
          /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi,
          function(_, p1, p2, p3, p4) {
            return (
              'rgba(' +
              Math.round(p1) +
              ', ' +
              Math.round(p2) +
              ', ' +
              Math.round(p3) +
              ', ' +
              p4 +
              ')'
            )
          }
        )
    )
  }
}

var config = {
  default: {
    tension: 170,
    friction: 26,
  },
  gentle: {
    tension: 120,
    friction: 14,
  },
  wobbly: {
    tension: 180,
    friction: 12,
  },
  stiff: {
    tension: 210,
    friction: 20,
  },
  slow: {
    tension: 280,
    friction: 60,
  },
  molasses: {
    tension: 280,
    friction: 120,
  },
}

var Spring =
  /*#__PURE__*/
  (function(_React$Component) {
    _inheritsLoose(Spring, _React$Component)

    function Spring() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this =
        _React$Component.call.apply(_React$Component, [this].concat(args)) ||
        this
      _this.state = {
        lastProps: {
          from: {},
          to: {},
        },
        propsChanged: false,
        internal: false,
      }
      _this.controller = new Controller(null, null)
      _this.didUpdate = false
      _this.didInject = false
      _this.finished = true

      _this.start = function() {
        _this.finished = false
        var wasMounted = _this.mounted

        _this.controller.start(function(props) {
          return _this.finish(
            _extends({}, props, {
              wasMounted: wasMounted,
            })
          )
        }, _this.update)
      }

      _this.stop = function() {
        return _this.controller.stop(true)
      }

      _this.update = function() {
        return (
          _this.mounted &&
          _this.setState({
            internal: true,
          })
        )
      }

      _this.finish = function(_ref) {
        var finished = _ref.finished,
          noChange = _ref.noChange,
          wasMounted = _ref.wasMounted
        _this.finished = true

        if (_this.mounted && finished) {
          // Only call onRest if either we *were* mounted, or when there were changes
          if (_this.props.onRest && (wasMounted || !noChange))
            _this.props.onRest(_this.controller.merged) // Restore end-state

          if (_this.mounted && _this.didInject) {
            _this.afterInject = convertValues(_this.props)

            _this.setState({
              internal: true,
            })
          } // If we have an inject or values to apply after the animation we ping here

          if (_this.mounted && (_this.didInject || _this.props.after))
            _this.setState({
              internal: true,
            })
          _this.didInject = false
        }
      }

      return _this
    }

    var _proto = Spring.prototype

    _proto.componentDidMount = function componentDidMount() {
      // componentDidUpdate isn't called on mount, we call it here to start animating
      this.componentDidUpdate()
      this.mounted = true
    }

    _proto.componentWillUnmount = function componentWillUnmount() {
      // Stop all ongoing animtions
      this.mounted = false
      this.stop()
    }

    Spring.getDerivedStateFromProps = function getDerivedStateFromProps(
      props,
      _ref2
    ) {
      var internal = _ref2.internal,
        lastProps = _ref2.lastProps
      // The following is a test against props that could alter the animation
      var from = props.from,
        to = props.to,
        reset = props.reset,
        force = props.force
      var propsChanged =
        !shallowEqual(to, lastProps.to) ||
        !shallowEqual(from, lastProps.from) ||
        (reset && !internal) ||
        (force && !internal)
      return {
        propsChanged: propsChanged,
        lastProps: props,
        internal: false,
      }
    }

    _proto.render = function render() {
      var _this2 = this

      var children = this.props.children
      var propsChanged = this.state.propsChanged // Inject phase -----------------------------------------------------------
      // Handle injected frames, for instance targets/web/fix-auto
      // An inject will return an intermediary React node which measures itself out
      // .. and returns a callback when the values sought after are ready, usually "auto".

      if (this.props.inject && propsChanged && !this.injectProps) {
        var frame = this.props.inject(this.props, function(injectProps) {
          // The inject frame has rendered, now let's update animations...
          _this2.injectProps = injectProps

          _this2.setState({
            internal: true,
          })
        }) // Render out injected frame

        if (frame) return frame
      } // Update phase -----------------------------------------------------------

      if (this.injectProps || propsChanged) {
        // We can potentially cause setState, but we're inside render, the flag prevents that
        this.didInject = false // Update animations, this turns from/to props into AnimatedValues
        // An update can occur on injected props, or when own-props have changed.

        if (this.injectProps) {
          this.controller.update(this.injectProps) // didInject is needed, because there will be a 3rd stage, where the original values
          // .. will be restored after the animation is finished. When someone animates towards
          // .. "auto", the end-result should be "auto", not "1999px", which would block nested
          // .. height/width changes.

          this.didInject = true
        } else if (propsChanged) this.controller.update(this.props) // Flag an update that occured, componentDidUpdate will start the animation later on

        this.didUpdate = true
        this.afterInject = undefined
        this.injectProps = undefined
      } // Render phase -----------------------------------------------------------
      // Render out raw values or AnimatedValues depending on "native"

      var values = _extends({}, this.controller.getValues(), this.afterInject)

      if (this.finished) values = _extends({}, values, this.props.after)
      return Object.keys(values).length ? children(values) : null
    }

    _proto.componentDidUpdate = function componentDidUpdate() {
      // The animation has to start *after* render, since at that point the scene
      // .. graph should be established, so we do it here. Unfortunatelly, non-native
      // .. animations as well as "auto"-injects call forceUpdate, so it's causing a loop.
      // .. didUpdate prevents that as it gets set only on prop changes.
      if (this.didUpdate) this.start()
      this.didUpdate = false
    }

    return Spring
  })(React__default.Component)

Spring.defaultProps = {
  from: {},
  to: {},
  config: config.default,
  native: false,
  immediate: false,
  reset: false,
  force: false,
  inject: bugfixes,
}

var Trail =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inheritsLoose(Trail, _React$PureComponent)

    function Trail() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this =
        _React$PureComponent.call.apply(
          _React$PureComponent,
          [this].concat(args)
        ) || this
      _this.first = true
      _this.instances = new Set()

      _this.hook = function(instance, index, length, reverse) {
        // Add instance to set
        _this.instances.add(instance) // Return undefined on the first index and from then on the previous instance

        if (reverse ? index === length - 1 : index === 0) return undefined
        else return Array.from(_this.instances)[reverse ? index + 1 : index - 1]
      }

      return _this
    }

    var _proto = Trail.prototype

    _proto.render = function render() {
      var _this2 = this

      var _this$props = this.props,
        items = _this$props.items,
        _children = _this$props.children,
        _this$props$from = _this$props.from,
        from = _this$props$from === void 0 ? {} : _this$props$from,
        initial = _this$props.initial,
        reverse = _this$props.reverse,
        keys = _this$props.keys,
        delay = _this$props.delay,
        onRest = _this$props.onRest,
        props = _objectWithoutPropertiesLoose(_this$props, [
          'items',
          'children',
          'from',
          'initial',
          'reverse',
          'keys',
          'delay',
          'onRest',
        ])

      var array = toArray(items)
      return toArray(array).map(function(item, i) {
        return React__default.createElement(
          Spring,
          _extends(
            {
              onRest: i === 0 ? onRest : null,
              key: typeof keys === 'function' ? keys(item) : toArray(keys)[i],
              from: _this2.first && initial !== void 0 ? initial || {} : from,
            },
            props,
            {
              delay: (i === 0 && delay) || undefined,
              attach: function attach(instance) {
                return _this2.hook(instance, i, array.length, reverse)
              },
              children: function children(props) {
                var child = _children(item, i)

                return child ? child(props) : null
              },
            }
          )
        )
      })
    }

    _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
      this.first = false
      if (prevProps.items !== this.props.items) this.instances.clear()
    }

    return Trail
  })(React__default.PureComponent)

Trail.defaultProps = {
  keys: function keys(item) {
    return item
  },
}

var DEFAULT = '__default'

var KeyframesImpl =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inheritsLoose(KeyframesImpl, _React$PureComponent)

    function KeyframesImpl() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this =
        _React$PureComponent.call.apply(
          _React$PureComponent,
          [this].concat(args)
        ) || this
      _this.guid = 0
      _this.state = {
        props: {},
        resolve: function resolve() {
          return null
        },
        last: true,
        index: 0,
      }

      _this.next = function(props, last, index) {
        if (last === void 0) {
          last = true
        }

        if (index === void 0) {
          index = 0
        }

        _this.running = true
        return new Promise(function(resolve) {
          _this.mounted &&
            _this.setState(
              function(state) {
                return {
                  props: props,
                  resolve: resolve,
                  last: last,
                  index: index,
                }
              },
              function() {
                return (_this.running = false)
              }
            )
        })
      }

      return _this
    }

    var _proto = KeyframesImpl.prototype

    _proto.componentDidMount = function componentDidMount() {
      this.mounted = true
      this.componentDidUpdate({})
    }

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.mounted = false
    }

    _proto.componentDidUpdate = function componentDidUpdate(previous) {
      var _this2 = this

      var _this$props = this.props,
        states = _this$props.states,
        f = _this$props.filter,
        state = _this$props.state

      if (
        previous.state !== this.props.state ||
        (this.props.reset && !this.running) ||
        !shallowEqual(states[state], previous.states[previous.state])
      ) {
        if (states && state && states[state]) {
          ;(function() {
            var localId = ++_this2.guid
            var slots = states[state]

            if (slots) {
              if (Array.isArray(slots)) {
                var q = Promise.resolve()

                var _loop = function _loop(i) {
                  var index = i
                  var slot = slots[index]
                  var last = index === slots.length - 1
                  q = q.then(function() {
                    return (
                      localId === _this2.guid &&
                      _this2.next(f(slot), last, index)
                    )
                  })
                }

                for (var i = 0; i < slots.length; i++) {
                  _loop(i)
                }
              } else if (typeof slots === 'function') {
                var index = 0
                slots(
                  // next
                  function(props, last) {
                    if (last === void 0) {
                      last = false
                    }

                    return (
                      localId === _this2.guid &&
                      _this2.next(f(props), last, index++)
                    )
                  }, // cancel
                  function() {
                    return requestFrame(function() {
                      return _this2.instance && _this2.instance.stop()
                    })
                  }, // ownprops
                  _this2.props
                )
              } else {
                _this2.next(f(states[state]))
              }
            }
          })()
        }
      }
    }

    _proto.render = function render() {
      var _this3 = this

      var _this$state = this.state,
        props = _this$state.props,
        resolve = _this$state.resolve,
        last = _this$state.last,
        index = _this$state.index
      if (!props || Object.keys(props).length === 0) return null

      var _this$props2 = this.props,
        state = _this$props2.state,
        filter = _this$props2.filter,
        states = _this$props2.states,
        config = _this$props2.config,
        Component = _this$props2.primitive,
        _onRest = _this$props2.onRest,
        forwardRef = _this$props2.forwardRef,
        rest = _objectWithoutPropertiesLoose(_this$props2, [
          'state',
          'filter',
          'states',
          'config',
          'primitive',
          'onRest',
          'forwardRef',
        ]) // Arrayed configs need an index to process

      if (Array.isArray(config)) config = config[index]
      return React__default.createElement(
        Component,
        _extends(
          {
            ref: function ref(_ref) {
              return (_this3.instance = handleRef(_ref, forwardRef))
            },
            config: config,
          },
          rest,
          props,
          {
            onRest: function onRest(args) {
              resolve(args)
              if (_onRest && last) _onRest(args)
            },
          }
        )
      )
    }

    return KeyframesImpl
  })(React__default.PureComponent)

KeyframesImpl.defaultProps = {
  state: DEFAULT,
}
var Keyframes = React__default.forwardRef(function(props, ref) {
  return React__default.createElement(
    KeyframesImpl,
    _extends({}, props, {
      forwardRef: ref,
    })
  )
})

Keyframes.create = function(primitive) {
  return function(states, filter) {
    var _states

    if (filter === void 0) {
      filter = function filter(states) {
        return states
      }
    }

    if (typeof states === 'function' || Array.isArray(states))
      states = ((_states = {}), (_states[DEFAULT] = states), _states)
    return function(props) {
      return React__default.createElement(
        KeyframesImpl,
        _extends(
          {
            primitive: primitive,
            states: states,
            filter: filter,
          },
          props
        )
      )
    }
  }
}

Keyframes.Spring = function(states) {
  return Keyframes.create(Spring)(states, interpolateTo)
}

Keyframes.Trail = function(states) {
  return Keyframes.create(Trail)(states, interpolateTo)
}

var guid = 0

var get = function get(props) {
  var items = props.items,
    keys = props.keys,
    rest = _objectWithoutPropertiesLoose(props, ['items', 'keys'])

  items = toArray(items !== void 0 ? items : null)
  keys = typeof keys === 'function' ? items.map(keys) : toArray(keys) // Make sure numeric keys are interpreted as Strings (5 !== "5")

  return _extends(
    {
      items: items,
      keys: keys.map(function(key) {
        return String(key)
      }),
    },
    rest
  )
}

var Transition =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inheritsLoose(Transition, _React$PureComponent)

    var _proto = Transition.prototype

    _proto.componentDidMount = function componentDidMount() {
      this.mounted = true
    }

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.mounted = false
    }

    function Transition(prevProps) {
      var _this

      _this = _React$PureComponent.call(this, prevProps) || this

      _this.destroyItem = function(item, key, state) {
        return function(values) {
          var _this$props = _this.props,
            onRest = _this$props.onRest,
            onDestroyed = _this$props.onDestroyed

          if (_this.mounted) {
            onDestroyed && onDestroyed(item)

            _this.setState(function(_ref) {
              var deleted = _ref.deleted
              return {
                deleted: deleted.filter(function(t) {
                  return t.key !== key
                }),
              }
            })

            onRest && onRest(item, state, values)
          }
        }
      }

      _this.state = {
        first: true,
        transitions: [],
        current: {},
        deleted: [],
        prevProps: prevProps,
      }
      return _this
    }

    Transition.getDerivedStateFromProps = function getDerivedStateFromProps(
      props,
      _ref2
    ) {
      var first = _ref2.first,
        prevProps = _ref2.prevProps,
        state = _objectWithoutPropertiesLoose(_ref2, ['first', 'prevProps'])

      var _get = get(props),
        items = _get.items,
        keys = _get.keys,
        initial = _get.initial,
        from = _get.from,
        enter = _get.enter,
        leave = _get.leave,
        update = _get.update,
        _get$trail = _get.trail,
        trail = _get$trail === void 0 ? 0 : _get$trail,
        unique = _get.unique,
        config = _get.config

      var _get2 = get(prevProps),
        _keys = _get2.keys,
        _items = _get2.items

      var current = _extends({}, state.current)

      var deleted = [].concat(state.deleted) // Compare next keys with current keys

      var currentKeys = Object.keys(current)
      var currentSet = new Set(currentKeys)
      var nextSet = new Set(keys)
      var added = keys.filter(function(item) {
        return !currentSet.has(item)
      })
      var removed = state.transitions
        .filter(function(item) {
          return !item.destroyed && !nextSet.has(item.originalKey)
        })
        .map(function(i) {
          return i.originalKey
        })
      var updated = keys.filter(function(item) {
        return currentSet.has(item)
      })
      var delay = 0
      added.forEach(function(key) {
        // In unique mode, remove fading out transitions if their key comes in again
        if (
          unique &&
          deleted.find(function(d) {
            return d.originalKey === key
          })
        )
          deleted = deleted.filter(function(t) {
            return t.originalKey !== key
          })
        var keyIndex = keys.indexOf(key)
        var item = items[keyIndex]
        var state = 'enter'
        current[key] = {
          state: state,
          originalKey: key,
          key: unique ? String(key) : guid++,
          item: item,
          trail: (delay = delay + trail),
          config: callProp(config, item, state),
          from: callProp(
            first ? (initial !== void 0 ? initial || {} : from) : from,
            item
          ),
          to: callProp(enter, item),
        }
      })
      removed.forEach(function(key) {
        var keyIndex = _keys.indexOf(key)

        var item = _items[keyIndex]
        var state = 'leave'
        deleted.push(
          _extends({}, current[key], {
            state: state,
            destroyed: true,
            left: _keys[Math.max(0, keyIndex - 1)],
            right: _keys[Math.min(_keys.length, keyIndex + 1)],
            trail: (delay = delay + trail),
            config: callProp(config, item, state),
            to: callProp(leave, item),
          })
        )
        delete current[key]
      })
      updated.forEach(function(key) {
        var keyIndex = keys.indexOf(key)
        var item = items[keyIndex]
        var state = 'update'
        current[key] = _extends({}, current[key], {
          item: item,
          state: state,
          trail: (delay = delay + trail),
          config: callProp(config, item, state),
          to: callProp(update, item),
        })
      }) // This tries to restore order for deleted items by finding their last known siblings

      var out = keys.map(function(key) {
        return current[key]
      })
      deleted.forEach(function(_ref3) {
        var left = _ref3.left,
          right = _ref3.right,
          transition = _objectWithoutPropertiesLoose(_ref3, ['left', 'right'])

        var pos // Was it the element on the left, if yes, move there ...

        if (
          (pos = out.findIndex(function(t) {
            return t.originalKey === left
          })) !== -1
        )
          pos += 1 // Or how about the element on the right ...

        if (pos === -1)
          pos = out.findIndex(function(t) {
            return t.originalKey === right
          }) // Maybe we'll find it in the list of deleted items

        if (pos === -1)
          pos = deleted.findIndex(function(t) {
            return t.originalKey === left
          }) // Checking right side as well

        if (pos === -1)
          pos = deleted.findIndex(function(t) {
            return t.originalKey === right
          }) // And if nothing else helps, move it to the start ¯\_(ツ)_/¯

        pos = Math.max(0, pos)
        out = [].concat(out.slice(0, pos), [transition], out.slice(pos))
      })
      return {
        first: first && added.length === 0,
        transitions: out,
        current: current,
        deleted: deleted,
        prevProps: props,
      }
    }

    _proto.render = function render() {
      var _this2 = this

      var _this$props2 = this.props,
        initial = _this$props2.initial,
        _this$props2$from = _this$props2.from,
        _this$props2$enter = _this$props2.enter,
        _this$props2$leave = _this$props2.leave,
        _this$props2$update = _this$props2.update,
        onDestroyed = _this$props2.onDestroyed,
        keys = _this$props2.keys,
        items = _this$props2.items,
        onFrame = _this$props2.onFrame,
        onRest = _this$props2.onRest,
        onStart = _this$props2.onStart,
        trail = _this$props2.trail,
        config = _this$props2.config,
        _children = _this$props2.children,
        unique = _this$props2.unique,
        reset = _this$props2.reset,
        extra = _objectWithoutPropertiesLoose(_this$props2, [
          'initial',
          'from',
          'enter',
          'leave',
          'update',
          'onDestroyed',
          'keys',
          'items',
          'onFrame',
          'onRest',
          'onStart',
          'trail',
          'config',
          'children',
          'unique',
          'reset',
        ])

      return this.state.transitions.map(function(_ref4, i) {
        var _ref5

        var state = _ref4.state,
          key = _ref4.key,
          item = _ref4.item,
          from = _ref4.from,
          to = _ref4.to,
          trail = _ref4.trail,
          config = _ref4.config,
          destroyed = _ref4.destroyed
        return React__default.createElement(
          Keyframes,
          _extends(
            {
              reset: reset && state === 'enter',
              primitive: Spring,
              state: state,
              filter: interpolateTo,
              states: ((_ref5 = {}), (_ref5[state] = to), _ref5),
              key: key,
              onRest: destroyed
                ? _this2.destroyItem(item, key, state)
                : onRest &&
                  function(values) {
                    return onRest(item, state, values)
                  },
              onStart:
                onStart &&
                function() {
                  return onStart(item, state)
                },
              onFrame:
                onFrame &&
                function(values) {
                  return onFrame(item, state, values)
                },
              delay: trail,
              config: config,
            },
            extra,
            {
              from: from,
              children: function children(props) {
                var child = _children(item, state, i)

                return child ? child(props) : null
              },
            }
          )
        )
      })
    }

    return Transition
  })(React__default.PureComponent)

Transition.defaultProps = {
  keys: function keys(item) {
    return item
  },
  unique: false,
  reset: false,
}

injectDefaultElement('Group')
injectInterpolation(createInterpolation)
injectColorNames(colors)
injectApplyAnimatedValues(
  function(instance, props) {
    if (instance.nodeType) {
      instance._applyProps(instance, props)
    } else return false
  },
  function(style) {
    return style
  }
)
var konvaElements = [
  'Layer',
  'FastLayer',
  'Group',
  'Label',
  'Rect',
  'Circle',
  'Ellipse',
  'Wedge',
  'Line',
  'Sprite',
  'Image',
  'Text',
  'TextPath',
  'Star',
  'Ring',
  'Arc',
  'Tag',
  'Path',
  'RegularPolygon',
  'Arrow',
  'Shape',
  'Transformer',
]
Object.assign(
  createAnimatedComponent,
  konvaElements.reduce(function(acc, element) {
    var _extends2

    return _extends(
      {},
      acc,
      ((_extends2 = {}),
      (_extends2[element] = createAnimatedComponent(element)),
      _extends2)
    )
  }, {})
)

exports.Spring = Spring
exports.Keyframes = Keyframes
exports.Transition = Transition
exports.Trail = Trail
exports.Controller = Controller
exports.config = config
exports.animated = createAnimatedComponent
exports.interpolate = interpolate$1
exports.Globals = Globals
