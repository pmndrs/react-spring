'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'))
var _objectWithoutPropertiesLoose = _interopDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var React = require('react')
var React__default = _interopDefault(React)
var _inheritsLoose = _interopDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)
var _assertThisInitialized = _interopDefault(
  require('@babel/runtime/helpers/assertThisInitialized')
)

var is = {
  arr: Array.isArray,
  obj: function obj(a) {
    return Object.prototype.toString.call(a) === '[object Object]'
  },
  fun: function fun(a) {
    return typeof a === 'function'
  },
  str: function str(a) {
    return typeof a === 'string'
  },
  num: function num(a) {
    return typeof a === 'number'
  },
  und: function und(a) {
    return a === void 0
  },
  nul: function nul(a) {
    return a === null
  },
  set: function set(a) {
    return a instanceof Set
  },
  map: function map(a) {
    return a instanceof Map
  },
  equ: function equ(a, b) {
    if (typeof a !== typeof b) return false
    if (is.str(a) || is.num(a)) return a === b
    if (
      is.obj(a) &&
      is.obj(b) &&
      Object.keys(a).length + Object.keys(b).length === 0
    )
      return true
    var i

    for (i in a) {
      if (!(i in b)) return false
    }

    for (i in b) {
      if (a[i] !== b[i]) return false
    }

    return is.und(i) ? a === b : true
  },
}
function merge(target, lowercase) {
  if (lowercase === void 0) {
    lowercase = true
  }

  return function(object) {
    return (is.arr(object) ? object : Object.keys(object)).reduce(function(
      acc,
      element
    ) {
      var key = lowercase
        ? element[0].toLowerCase() + element.substring(1)
        : element
      acc[key] = target(key)
      return acc
    },
    target)
  }
}
function useForceUpdate() {
  var _useState = React.useState(false),
    f = _useState[1]

  var forceUpdate = React.useCallback(function() {
    return f(function(v) {
      return !v
    })
  }, [])
  return forceUpdate
}
function withDefault(value, defaultValue) {
  return is.und(value) || is.nul(value) ? defaultValue : value
}
function toArray(a) {
  return !is.und(a) ? (is.arr(a) ? a : [a]) : []
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

  return is.fun(obj) ? obj.apply(void 0, args) : obj
}

function getForwardProps(props) {
  var to = props.to,
    from = props.from,
    config = props.config,
    onStart = props.onStart,
    onRest = props.onRest,
    onFrame = props.onFrame,
    children = props.children,
    reset = props.reset,
    reverse = props.reverse,
    force = props.force,
    immediate = props.immediate,
    delay = props.delay,
    attach = props.attach,
    destroyed = props.destroyed,
    interpolateTo = props.interpolateTo,
    ref = props.ref,
    lazy = props.lazy,
    forward = _objectWithoutPropertiesLoose(props, [
      'to',
      'from',
      'config',
      'onStart',
      'onRest',
      'onFrame',
      'children',
      'reset',
      'reverse',
      'force',
      'immediate',
      'delay',
      'attach',
      'destroyed',
      'interpolateTo',
      'ref',
      'lazy',
    ])

  return forward
}

function interpolateTo(props) {
  var forward = getForwardProps(props)
  if (is.und(forward))
    return _extends(
      {
        to: forward,
      },
      props
    )
  var rest = Object.keys(props).reduce(function(a, k) {
    var _extends2

    return !is.und(forward[k])
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
function handleRef(ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (is.fun(forward)) forward(ref)
    else if (is.obj(forward)) {
      forward.current = ref
    }
  }

  return ref
}

var Animated =
  /*#__PURE__*/
  (function() {
    function Animated() {
      this.payload = void 0
      this.children = []
    }

    var _proto = Animated.prototype

    _proto.getAnimatedValue = function getAnimatedValue() {
      return this.getValue()
    }

    _proto.getPayload = function getPayload() {
      return this.payload || this
    }

    _proto.attach = function attach() {}

    _proto.detach = function detach() {}

    _proto.getChildren = function getChildren() {
      return this.children
    }

    _proto.addChild = function addChild(child) {
      if (this.children.length === 0) this.attach()
      this.children.push(child)
    }

    _proto.removeChild = function removeChild(child) {
      var index = this.children.indexOf(child)
      this.children.splice(index, 1)
      if (this.children.length === 0) this.detach()
    }

    return Animated
  })()
var AnimatedArray =
  /*#__PURE__*/
  (function(_Animated) {
    _inheritsLoose(AnimatedArray, _Animated)

    function AnimatedArray() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this = _Animated.call.apply(_Animated, [this].concat(args)) || this
      _this.payload = []

      _this.attach = function() {
        return _this.payload.forEach(function(p) {
          return (
            p instanceof Animated && p.addChild(_assertThisInitialized(_this))
          )
        })
      }

      _this.detach = function() {
        return _this.payload.forEach(function(p) {
          return (
            p instanceof Animated &&
            p.removeChild(_assertThisInitialized(_this))
          )
        })
      }

      return _this
    }

    return AnimatedArray
  })(Animated)
var AnimatedObject =
  /*#__PURE__*/
  (function(_Animated2) {
    _inheritsLoose(AnimatedObject, _Animated2)

    function AnimatedObject() {
      var _this2

      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }

      _this2 = _Animated2.call.apply(_Animated2, [this].concat(args)) || this
      _this2.payload = {}

      _this2.attach = function() {
        return Object.values(_this2.payload).forEach(function(s) {
          return (
            s instanceof Animated && s.addChild(_assertThisInitialized(_this2))
          )
        })
      }

      _this2.detach = function() {
        return Object.values(_this2.payload).forEach(function(s) {
          return (
            s instanceof Animated &&
            s.removeChild(_assertThisInitialized(_this2))
          )
        })
      }

      return _this2
    }

    var _proto2 = AnimatedObject.prototype

    _proto2.getValue = function getValue(animated) {
      if (animated === void 0) {
        animated = false
      }

      var payload = {}

      for (var _key4 in this.payload) {
        var value = this.payload[_key4]
        if (animated && !(value instanceof Animated)) continue
        payload[_key4] =
          value instanceof Animated
            ? value[animated ? 'getAnimatedValue' : 'getValue']()
            : value
      }

      return payload
    }

    _proto2.getAnimatedValue = function getAnimatedValue() {
      return this.getValue(true)
    }

    return AnimatedObject
  })(Animated)

var applyAnimatedValues
function injectApplyAnimatedValues(fn, transform) {
  applyAnimatedValues = {
    fn: fn,
    transform: transform,
  }
}
var colorNames
function injectColorNames(names) {
  colorNames = names
}
var requestFrame = function requestFrame(cb) {
  return typeof window !== 'undefined' ? window.requestAnimationFrame(cb) : -1
}
var cancelFrame = function cancelFrame(id) {
  typeof window !== 'undefined' && window.cancelAnimationFrame(id)
}
function injectFrame(raf, caf) {
  requestFrame = raf
  cancelFrame = caf
}
var interpolation
function injectStringInterpolator(fn) {
  interpolation = fn
}
var now = function now() {
  return Date.now()
}
function injectNow(nowFn) {
  now = nowFn
}
var defaultElement
function injectDefaultElement(el) {
  defaultElement = el
}
var animatedApi = function animatedApi(node) {
  return node.current
}
function injectAnimatedApi(fn) {
  animatedApi = fn
}
var createAnimatedStyle
function injectCreateAnimatedStyle(factory) {
  createAnimatedStyle = factory
}
var manualFrameloop
function injectManualFrameloop(callback) {
  manualFrameloop = callback
}

var Globals = /*#__PURE__*/ Object.freeze({
  get applyAnimatedValues() {
    return applyAnimatedValues
  },
  injectApplyAnimatedValues: injectApplyAnimatedValues,
  get colorNames() {
    return colorNames
  },
  injectColorNames: injectColorNames,
  get requestFrame() {
    return requestFrame
  },
  get cancelFrame() {
    return cancelFrame
  },
  injectFrame: injectFrame,
  get interpolation() {
    return interpolation
  },
  injectStringInterpolator: injectStringInterpolator,
  get now() {
    return now
  },
  injectNow: injectNow,
  get defaultElement() {
    return defaultElement
  },
  injectDefaultElement: injectDefaultElement,
  get animatedApi() {
    return animatedApi
  },
  injectAnimatedApi: injectAnimatedApi,
  get createAnimatedStyle() {
    return createAnimatedStyle
  },
  injectCreateAnimatedStyle: injectCreateAnimatedStyle,
  get manualFrameloop() {
    return manualFrameloop
  },
  injectManualFrameloop: injectManualFrameloop,
})

/**
 * Wraps the `style` property with `AnimatedStyle`.
 */

var AnimatedProps =
  /*#__PURE__*/
  (function(_AnimatedObject) {
    _inheritsLoose(AnimatedProps, _AnimatedObject)

    function AnimatedProps(props, callback) {
      var _this

      _this = _AnimatedObject.call(this) || this
      _this.update = void 0
      _this.payload = !props.style
        ? props
        : _extends({}, props, {
            style: createAnimatedStyle(props.style),
          })
      _this.update = callback

      _this.attach()

      return _this
    }

    return AnimatedProps
  })(AnimatedObject)

var isFunctionComponent = function isFunctionComponent(val) {
  return is.fun(val) && !(val.prototype instanceof React__default.Component)
}

var createAnimatedComponent = function createAnimatedComponent(Component) {
  var AnimatedComponent = React.forwardRef(function(props, ref) {
    var forceUpdate = useForceUpdate()
    var mounted = React.useRef(true)
    var propsAnimated = React.useRef(null)
    var node = React.useRef(null)
    var attachProps = React.useCallback(function(props) {
      var oldPropsAnimated = propsAnimated.current

      var callback = function callback() {
        var didUpdate = false

        if (node.current) {
          didUpdate = applyAnimatedValues.fn(
            node.current,
            propsAnimated.current.getAnimatedValue()
          )
        }

        if (!node.current || didUpdate === false) {
          // If no referenced node has been found, or the update target didn't have a
          // native-responder, then forceUpdate the animation ...
          forceUpdate()
        }
      }

      propsAnimated.current = new AnimatedProps(props, callback)
      oldPropsAnimated && oldPropsAnimated.detach()
    }, [])
    React.useEffect(function() {
      return function() {
        mounted.current = false
        propsAnimated.current && propsAnimated.current.detach()
      }
    }, [])
    React.useImperativeHandle(ref, function() {
      return animatedApi(node, mounted, forceUpdate)
    })
    attachProps(props)

    var _getValue = propsAnimated.current.getValue(),
      scrollTop = _getValue.scrollTop,
      scrollLeft = _getValue.scrollLeft,
      animatedProps = _objectWithoutPropertiesLoose(_getValue, [
        'scrollTop',
        'scrollLeft',
      ]) // Functions cannot have refs, see:
    // See: https://github.com/react-spring/react-spring/issues/569

    var refFn = isFunctionComponent(Component)
      ? undefined
      : function(childRef) {
          return (node.current = handleRef(childRef, ref))
        }
    return React__default.createElement(
      Component,
      _extends({}, animatedProps, {
        ref: refFn,
      })
    )
  })
  return AnimatedComponent
}

var active = false
var controllers = new Set()

var update = function update() {
  if (!active) return false
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
    var isActive = false

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
        var velocity = Array.isArray(config.initialVelocity)
          ? config.initialVelocity[valIdx]
          : config.initialVelocity
        if (isAnimated) to = to.getValue() // Conclude animation if it's either immediate, or from-values match end-state

        if (config.immediate) {
          animation.setValue(to)
          animation.done = true
          continue
        } // Break animation when string values are involved

        if (typeof from === 'string' || typeof to === 'string') {
          animation.setValue(to)
          animation.done = true
          continue
        }

        if (config.duration !== void 0) {
          /** Duration easing */
          position =
            from +
            config.easing((time - animation.startTime) / config.duration) *
              (to - from)
          endOfAnimation = time >= animation.startTime + config.duration
        } else if (config.decay) {
          /** Decay easing */
          position =
            from +
            (velocity / (1 - 0.998)) *
              (1 - Math.exp(-(1 - 0.998) * (time - animation.startTime)))
          endOfAnimation = Math.abs(animation.lastPosition - position) < 0.1
          if (endOfAnimation) to = position
        } else {
          /** Spring easing */
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : time
          velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
              : config.initialVelocity // If we lost a lot of frames just jump to the end.

          if (time > lastTime + 64) lastTime = time // http://gafferongames.com/game-physics/fix-your-timestep/

          var numSteps = Math.floor(time - lastTime)

          for (var i = 0; i < numSteps; ++i) {
            var force = -config.tension * (position - to)
            var damping = -config.friction * velocity
            var acceleration = (force + damping) / config.mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          } // Conditions for stopping the spring animation

          var isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          var isVelocity = Math.abs(velocity) <= config.precision
          var isDisplacement =
            config.tension !== 0
              ? Math.abs(to - position) <= config.precision
              : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)
          animation.lastVelocity = velocity
          animation.lastTime = time
        } // Trails aren't done until their parents conclude

        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to
          animation.done = true
        } else isActive = true

        animation.setValue(position)
        animation.lastPosition = position
      } // Keep track of updated values only when necessary

      if (controller.props.onFrame)
        controller.values[config.name] = config.interpolation.getValue()
    } // Update callbacks in the end of the frame

    if (controller.props.onFrame) controller.props.onFrame(controller.values) // Either call onEnd or next frame

    if (!isActive) {
      controllers.delete(controller)
      controller.stop(true)
    }
  } // Loop over as long as there are controllers ...

  if (controllers.size) {
    if (manualFrameloop) manualFrameloop()
    else requestFrame(update)
  } else {
    active = false
  }

  return active
}

var start = function start(controller) {
  if (!controllers.has(controller)) controllers.add(controller)

  if (!active) {
    active = true
    if (manualFrameloop) requestFrame(manualFrameloop)
    else requestFrame(update)
  }
}

var stop = function stop(controller) {
  if (controllers.has(controller)) controllers.delete(controller)
}

function createInterpolator(range, output, extrapolate) {
  if (typeof range === 'function') {
    return range
  }

  if (Array.isArray(range)) {
    return createInterpolator({
      range: range,
      output: output,
      extrapolate: extrapolate,
    })
  }

  if (interpolation && typeof range.output[0] === 'string') {
    return interpolation(range)
  }

  var config = range
  var outputRange = config.output
  var inputRange = config.range || [0, 1]
  var extrapolateLeft = config.extrapolateLeft || config.extrapolate || 'extend'
  var extrapolateRight =
    config.extrapolateRight || config.extrapolate || 'extend'

  var easing =
    config.easing ||
    function(t) {
      return t
    }

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
      config.map
    )
  }
}

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
  (function(_AnimatedArray) {
    _inheritsLoose(AnimatedInterpolation, _AnimatedArray)

    function AnimatedInterpolation(parents, range, output, extrapolate) {
      var _this

      _this = _AnimatedArray.call(this) || this
      _this.calc = void 0
      _this.payload =
        parents instanceof AnimatedArray &&
        !(parents instanceof AnimatedInterpolation)
          ? parents.getPayload()
          : Array.isArray(parents)
          ? parents
          : [parents]
      _this.calc = createInterpolator(range, output, extrapolate)
      return _this
    }

    var _proto = AnimatedInterpolation.prototype

    _proto.getValue = function getValue() {
      return this.calc.apply(
        this,
        this.payload.map(function(value) {
          return value.getValue()
        })
      )
    }

    _proto.updateConfig = function updateConfig(range, output, extrapolate) {
      this.calc = createInterpolator(range, output, extrapolate)
    }

    _proto.interpolate = function interpolate(range, output, extrapolate) {
      return new AnimatedInterpolation(this, range, output, extrapolate)
    }

    return AnimatedInterpolation
  })(AnimatedArray)

var interpolate$1 = function interpolate(parents, range, output) {
  return parents && new AnimatedInterpolation(parents, range, output)
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

/** API
 *  useChain(references, timeSteps, timeFrame)
 */

function useChain(refs, timeSteps, timeFrame) {
  if (timeFrame === void 0) {
    timeFrame = 1000
  }

  var previous = React.useRef()
  React.useEffect(function() {
    if (is.equ(refs, previous.current))
      refs.forEach(function(_ref) {
        var current = _ref.current
        return current && current.start()
      })
    else if (timeSteps) {
      refs.forEach(function(_ref2, index) {
        var current = _ref2.current

        if (current) {
          var ctrls = current.controllers

          if (ctrls.length) {
            var t = timeFrame * timeSteps[index]
            ctrls.forEach(function(ctrl) {
              ctrl.queue = ctrl.queue.map(function(e) {
                return _extends({}, e, {
                  delay: e.delay + t,
                })
              })
              ctrl.start()
            })
          }
        }
      })
    } else
      refs.reduce(function(q, _ref3, rI) {
        var current = _ref3.current
        return (q = q.then(function() {
          return current.start()
        }))
      }, Promise.resolve())
    previous.current = refs
  })
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

var AnimatedValue =
  /*#__PURE__*/
  (function(_Animated) {
    _inheritsLoose(AnimatedValue, _Animated)

    function AnimatedValue(_value) {
      var _this

      _this = _Animated.call(this) || this
      _this.animatedStyles = new Set()
      _this.value = void 0
      _this.startPosition = void 0
      _this.lastPosition = void 0
      _this.lastVelocity = void 0
      _this.startTime = void 0
      _this.lastTime = void 0
      _this.done = false

      _this.setValue = function(value, flush) {
        if (flush === void 0) {
          flush = true
        }

        _this.value = value
        if (flush) _this.flush()
      }

      _this.value = _value
      _this.startPosition = _value
      _this.lastPosition = _value
      return _this
    }

    var _proto = AnimatedValue.prototype

    _proto.flush = function flush() {
      if (this.animatedStyles.size === 0) {
        addAnimatedStyles(this, this.animatedStyles)
      }

      this.animatedStyles.forEach(function(animatedStyle) {
        return animatedStyle.update()
      })
    }

    _proto.clearStyles = function clearStyles() {
      this.animatedStyles.clear()
    }

    _proto.getValue = function getValue() {
      return this.value
    }

    _proto.interpolate = function interpolate(range, output, extrapolate) {
      return new AnimatedInterpolation(this, range, output, extrapolate)
    }

    return AnimatedValue
  })(Animated)

var AnimatedValueArray =
  /*#__PURE__*/
  (function(_AnimatedArray) {
    _inheritsLoose(AnimatedValueArray, _AnimatedArray)

    function AnimatedValueArray(values) {
      var _this

      _this = _AnimatedArray.call(this) || this
      _this.payload = values.map(function(n) {
        return new AnimatedValue(n)
      })
      return _this
    }

    var _proto = AnimatedValueArray.prototype

    _proto.setValue = function setValue(value, flush) {
      var _this2 = this

      if (flush === void 0) {
        flush = true
      }

      if (Array.isArray(value)) {
        if (value.length === this.payload.length) {
          value.forEach(function(v, i) {
            return _this2.payload[i].setValue(v, flush)
          })
        }
      } else {
        this.payload.forEach(function(p) {
          return p.setValue(value, flush)
        })
      }
    }

    _proto.getValue = function getValue() {
      return this.payload.map(function(v) {
        return v.getValue()
      })
    }

    _proto.interpolate = function interpolate(range, output) {
      return new AnimatedInterpolation(this, range, output)
    }

    return AnimatedValueArray
  })(AnimatedArray)

var G = 0

var Controller =
  /*#__PURE__*/
  (function() {
    function Controller() {
      var _this = this

      this.id = void 0
      this.idle = true
      this.hasChanged = false
      this.guid = 0
      this.local = 0
      this.props = {}
      this.merged = {}
      this.animations = {}
      this.interpolations = {}
      this.values = {}
      this.configs = []
      this.listeners = []
      this.queue = []
      this.localQueue = void 0

      this.getValues = function() {
        return _this.interpolations
      }

      this.id = G++
    }
    /** update(props)
     *  This function filters input props and creates an array of tasks which are executed in .start()
     *  Each task is allowed to carry a delay, which means it can execute asnychroneously */

    var _proto = Controller.prototype

    _proto.update = function update$$1(args) {
      //this._id = n + this.id
      if (!args) return this // Extract delay and the to-prop from props

      var _ref = interpolateTo(args),
        _ref$delay = _ref.delay,
        delay = _ref$delay === void 0 ? 0 : _ref$delay,
        to = _ref.to,
        props = _objectWithoutPropertiesLoose(_ref, ['delay', 'to'])

      if (is.arr(to) || is.fun(to)) {
        // If config is either a function or an array queue it up as is
        this.queue.push(
          _extends({}, props, {
            delay: delay,
            to: to,
          })
        )
      } else if (to) {
        // Otherwise go through each key since it could be delayed individually
        var ops = {}
        Object.entries(to).forEach(function(_ref2) {
          var _to

          var k = _ref2[0],
            v = _ref2[1]

          // Fetch delay and create an entry, consisting of the to-props, the delay, and basic props
          var entry = _extends(
            {
              to: ((_to = {}), (_to[k] = v), _to),
              delay: callProp(delay, k),
            },
            props
          )

          var previous = ops[entry.delay] && ops[entry.delay].to
          ops[entry.delay] = _extends({}, ops[entry.delay], entry, {
            to: _extends({}, previous, entry.to),
          })
        })
        this.queue = Object.values(ops)
      } // Sort queue, so that async calls go last

      this.queue = this.queue.sort(function(a, b) {
        return a.delay - b.delay
      }) // Diff the reduced props immediately (they'll contain the from-prop and some config)

      this.diff(props)
      return this
    }
    /** start(onEnd)
     *  This function either executes a queue, if present, or starts the frameloop, which animates */

    _proto.start = function start$$1(onEnd) {
      var _this2 = this

      // If a queue is present we must excecute it
      if (this.queue.length) {
        this.idle = false // Updates can interrupt trailing queues, in that case we just merge values

        if (this.localQueue) {
          this.localQueue.forEach(function(_ref3) {
            var _ref3$from = _ref3.from,
              from = _ref3$from === void 0 ? {} : _ref3$from,
              _ref3$to = _ref3.to,
              to = _ref3$to === void 0 ? {} : _ref3$to
            if (is.obj(from)) _this2.merged = _extends({}, from, _this2.merged)
            if (is.obj(to)) _this2.merged = _extends({}, _this2.merged, to)
          })
        } // The guid helps us tracking frames, a new queue over an old one means an override
        // We discard async calls in that caseÍ

        var local = (this.local = ++this.guid)
        var queue = (this.localQueue = this.queue)
        this.queue = [] // Go through each entry and execute it

        queue.forEach(function(_ref4, index) {
          var delay = _ref4.delay,
            props = _objectWithoutPropertiesLoose(_ref4, ['delay'])

          var cb = function cb(finished) {
            if (
              index === queue.length - 1 &&
              local === _this2.guid &&
              finished
            ) {
              _this2.idle = true
              if (_this2.props.onRest) _this2.props.onRest(_this2.merged)
            }

            if (onEnd) onEnd()
          } // Entries can be delayed, ansyc or immediate

          var async = is.arr(props.to) || is.fun(props.to)

          if (delay) {
            setTimeout(function() {
              if (local === _this2.guid) {
                if (async) _this2.runAsync(props, cb)
                else _this2.diff(props).start(cb)
              }
            }, delay)
          } else if (async) _this2.runAsync(props, cb)
          else _this2.diff(props).start(cb)
        })
      } // Otherwise we kick of the frameloop
      else {
        if (is.fun(onEnd)) this.listeners.push(onEnd)
        if (this.props.onStart) this.props.onStart()

        start(this)
      }

      return this
    }

    _proto.stop = function stop$$1(finished) {
      this.listeners.forEach(function(onEnd) {
        return onEnd(finished)
      })
      this.listeners = []
      return this
    }
    /** Pause sets onEnd listeners free, but also removes the controller from the frameloop */

    _proto.pause = function pause(finished) {
      this.stop(true)
      if (finished) stop(this)
      return this
    }

    _proto.runAsync = function runAsync(_ref5, onEnd) {
      var _this3 = this

      var delay = _ref5.delay,
        props = _objectWithoutPropertiesLoose(_ref5, ['delay'])

      var local = this.local // If "to" is either a function or an array it will be processed async, therefor "to" should be empty right now
      // If the view relies on certain values "from" has to be present

      var queue = Promise.resolve(undefined)

      if (is.arr(props.to)) {
        var _loop = function _loop(i) {
          var index = i

          var fresh = _extends({}, props, interpolateTo(props.to[index]))

          if (is.arr(fresh.config)) fresh.config = fresh.config[index]
          queue = queue.then(function() {
            //this.stop()
            if (local === _this3.guid)
              return new Promise(function(r) {
                return _this3.diff(fresh).start(r)
              })
          })
        }

        for (var i = 0; i < props.to.length; i++) {
          _loop(i)
        }
      } else if (is.fun(props.to)) {
        var index = 0
        var last
        queue = queue.then(function() {
          return props
            .to(
              // next(props)
              function(p) {
                var fresh = _extends({}, props, interpolateTo(p))

                if (is.arr(fresh.config)) fresh.config = fresh.config[index]
                index++ //this.stop()

                if (local === _this3.guid)
                  return (last = new Promise(function(r) {
                    return _this3.diff(fresh).start(r)
                  }))
                return
              }, // cancel()
              function(finished) {
                if (finished === void 0) {
                  finished = true
                }

                return _this3.stop(finished)
              }
            )
            .then(function() {
              return last
            })
        })
      }

      queue.then(onEnd)
    }

    _proto.diff = function diff(props) {
      var _this4 = this

      this.props = _extends({}, this.props, props)
      var _this$props = this.props,
        _this$props$from = _this$props.from,
        from = _this$props$from === void 0 ? {} : _this$props$from,
        _this$props$to = _this$props.to,
        to = _this$props$to === void 0 ? {} : _this$props$to,
        _this$props$config = _this$props.config,
        config = _this$props$config === void 0 ? {} : _this$props$config,
        reverse = _this$props.reverse,
        attach = _this$props.attach,
        reset = _this$props.reset,
        immediate = _this$props.immediate // Reverse values when requested

      if (reverse) {
        var _ref6 = [to, from]
        from = _ref6[0]
        to = _ref6[1]
      } // This will collect all props that were ever set, reset merged props when necessary

      this.merged = _extends({}, from, this.merged, to)
      this.hasChanged = false // Attachment handling, trailed springs can "attach" themselves to a previous spring

      var target = attach && attach(this) // Reduces input { name: value } pairs into animated values

      this.animations = Object.entries(this.merged).reduce(function(
        acc,
        _ref7
      ) {
        var name = _ref7[0],
          value = _ref7[1]
        // Issue cached entries, except on reset
        var entry = acc[name] || {} // Figure out what the value is supposed to be

        var isNumber = is.num(value)
        var isString =
          is.str(value) &&
          !value.startsWith('#') &&
          !/\d/.test(value) &&
          !colorNames[value]
        var isArray = is.arr(value)
        var isInterpolation = !isNumber && !isArray && !isString
        var fromValue = !is.und(from[name]) ? from[name] : value
        var toValue = isNumber || isArray ? value : isString ? value : 1
        var toConfig = callProp(config, name)
        if (target) toValue = target.animations[name].parent
        var parent = entry.parent,
          interpolation$$1 = entry.interpolation,
          toValues = toArray(target ? toValue.getPayload() : toValue),
          animatedValues
        var newValue = value
        if (isInterpolation)
          newValue = interpolation({
            range: [0, 1],
            output: [value, value],
          })(1)
        var currentValue = interpolation$$1 && interpolation$$1.getValue() // Change detection flags

        var isFirst = is.und(parent)
        var isActive =
          !isFirst &&
          entry.animatedValues.some(function(v) {
            return !v.done
          })
        var currentValueDiffersFromGoal = !is.equ(newValue, currentValue)
        var hasNewGoal = !is.equ(newValue, entry.previous)
        var hasNewConfig = !is.equ(toConfig, entry.config) // Change animation props when props indicate a new goal (new value differs from previous one)
        // and current values differ from it. Config changes trigger a new update as well (though probably shouldn't?)

        if (
          reset ||
          (hasNewGoal && currentValueDiffersFromGoal) ||
          hasNewConfig
        ) {
          var _extends2

          // Convert regular values into animated values, ALWAYS re-use if possible
          if (isNumber || isString)
            parent = interpolation$$1 =
              entry.parent || new AnimatedValue(fromValue)
          else if (isArray)
            parent = interpolation$$1 =
              entry.parent || new AnimatedValueArray(fromValue)
          else if (isInterpolation) {
            var prev =
              entry.interpolation &&
              entry.interpolation.calc(entry.parent.value)
            prev = prev !== void 0 && !reset ? prev : fromValue

            if (entry.parent) {
              parent = entry.parent
              parent.setValue(0, false)
            } else parent = new AnimatedValue(0)

            var range = {
              output: [prev, value],
            }

            if (entry.interpolation) {
              interpolation$$1 = entry.interpolation
              entry.interpolation.updateConfig(range)
            } else interpolation$$1 = parent.interpolate(range)
          }
          toValues = toArray(target ? toValue.getPayload() : toValue)
          animatedValues = toArray(parent.getPayload())
          if (reset && !isInterpolation) parent.setValue(fromValue, false)
          _this4.hasChanged = true // Reset animated values

          animatedValues.forEach(function(value) {
            value.startPosition = value.value
            value.lastPosition = value.value
            value.lastVelocity = isActive ? value.lastVelocity : undefined
            value.lastTime = isActive ? value.lastTime : undefined
            value.startTime = now()
            value.done = false
            value.animatedStyles.clear()
          }) // Set immediate values

          if (callProp(immediate, name)) {
            parent.setValue(isInterpolation ? toValue : value, false)
          }

          return _extends(
            {},
            acc,
            ((_extends2 = {}),
            (_extends2[name] = _extends({}, entry, {
              name: name,
              parent: parent,
              interpolation: interpolation$$1,
              animatedValues: animatedValues,
              toValues: toValues,
              previous: newValue,
              config: toConfig,
              fromValues: toArray(parent.getValue()),
              immediate: callProp(immediate, name),
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
        } else {
          if (!currentValueDiffersFromGoal) {
            var _extends3

            // So ... the current target value (newValue) appears to be different from the previous value,
            // which normally constitutes an update, but the actual value (currentValue) matches the target!
            // In order to resolve this without causing an animation update we silently flag the animation as done,
            // which it technically is. Interpolations also needs a config update with their target set to 1.
            if (isInterpolation) {
              parent.setValue(1, false)
              interpolation$$1.updateConfig({
                output: [newValue, newValue],
              })
            }

            parent.done = true
            _this4.hasChanged = true
            return _extends(
              {},
              acc,
              ((_extends3 = {}),
              (_extends3[name] = _extends({}, acc[name], {
                previous: newValue,
              })),
              _extends3)
            )
          }

          return acc
        }
      },
      this.animations)

      if (this.hasChanged) {
        // Make animations available to frameloop
        this.configs = Object.values(this.animations)
        this.values = {}
        this.interpolations = {}

        for (var key in this.animations) {
          this.interpolations[key] = this.animations[key].interpolation
          this.values[key] = this.animations[key].interpolation.getValue()
        }
      }

      return this
    }

    _proto.destroy = function destroy() {
      this.stop()
      this.props = {}
      this.merged = {}
      this.animations = {}
      this.interpolations = {}
      this.values = {}
      this.configs = []
      this.local = 0
    }

    return Controller
  })()

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

var useSprings = function useSprings(length, props) {
  var mounted = React.useRef(false)
  var ctrl = React.useRef()
  var isFn = is.fun(props) // The controller maintains the animation values, starts and stops animations

  var _useMemo = React.useMemo(
      function() {
        // Remove old controllers
        if (ctrl.current) {
          ctrl.current.map(function(c) {
            return c.destroy()
          })
          ctrl.current = undefined
        }

        var ref
        return [
          new Array(length).fill().map(function(_, i) {
            var ctrl = new Controller()
            var newProps = isFn ? callProp(props, i, ctrl) : props[i]
            if (i === 0) ref = newProps.ref
            ctrl.update(newProps)
            if (!ref) ctrl.start()
            return ctrl
          }),
          ref,
        ]
      },
      [length]
    ),
    controllers = _useMemo[0],
    ref = _useMemo[1]

  ctrl.current = controllers // The hooks reference api gets defined here ...

  var api = React.useImperativeHandle(ref, function() {
    return {
      start: function start() {
        return Promise.all(
          ctrl.current.map(function(c) {
            return new Promise(function(r) {
              return c.start(r)
            })
          })
        )
      },
      stop: function stop(finished) {
        return ctrl.current.forEach(function(c) {
          return c.stop(finished)
        })
      },

      get controllers() {
        return ctrl.current
      },
    }
  }) // This function updates the controllers

  var updateCtrl = React.useMemo(
    function() {
      return function(updateProps) {
        return ctrl.current.map(function(c, i) {
          c.update(isFn ? callProp(updateProps, i, c) : updateProps[i])
          if (!ref) c.start()
        })
      }
    },
    [length]
  ) // Update controller if props aren't functional

  React.useEffect(function() {
    if (mounted.current) {
      if (!isFn) updateCtrl(props)
    } else if (!ref)
      ctrl.current.forEach(function(c) {
        return c.start()
      })
  }) // Update mounted flag and destroy controller on unmount

  React.useEffect(function() {
    return (
      (mounted.current = true),
      function() {
        return ctrl.current.forEach(function(c) {
          return c.destroy()
        })
      }
    )
  }, []) // Return animated props, or, anim-props + the update-setter above

  var propValues = ctrl.current.map(function(c) {
    return c.getValues()
  })
  return isFn
    ? [
        propValues,
        updateCtrl,
        function(finished) {
          return ctrl.current.forEach(function(c) {
            return c.pause(finished)
          })
        },
      ]
    : propValues
}

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

var useSpring = function useSpring(props) {
  var isFn = is.fun(props)

  var _useSprings = useSprings(1, isFn ? props : [props]),
    result = _useSprings[0],
    set = _useSprings[1],
    pause = _useSprings[2]

  return isFn ? [result[0], set, pause] : result
}

/** API
 * const trails = useTrail(number, { ... })
 * const [trails, set] = useTrail(number, () => ({ ... }))
 */

var useTrail = function useTrail(length, props) {
  var mounted = React.useRef(false)
  var isFn = is.fun(props)
  var updateProps = callProp(props)
  var instances = React.useRef()

  var _useSprings = useSprings(length, function(i, ctrl) {
      if (i === 0) instances.current = []
      instances.current.push(ctrl)
      return _extends({}, updateProps, {
        config: callProp(updateProps.config, i),
        attach:
          i > 0 &&
          function() {
            return instances.current[i - 1]
          },
      })
    }),
    result = _useSprings[0],
    set = _useSprings[1],
    pause = _useSprings[2] // Set up function to update controller

  var updateCtrl = React.useMemo(
    function() {
      return function(props) {
        return set(function(i, ctrl) {
          var last = props.reverse ? i === 0 : length - 1 === i
          var attachIdx = props.reverse ? i + 1 : i - 1
          var attachController = instances.current[attachIdx]
          return _extends({}, props, {
            config: callProp(props.config || updateProps.config, i),
            attach:
              attachController &&
              function() {
                return attachController
              },
          })
        })
      }
    },
    [length, updateProps.reverse]
  ) // Update controller if props aren't functional

  React.useEffect(function() {
    return void (mounted.current && !isFn && updateCtrl(props))
  }) // Update mounted flag and destroy controller on unmount

  React.useEffect(function() {
    return void (mounted.current = true)
  }, [])
  return isFn ? [result, updateCtrl, pause] : result
}

/** API
 * const transitions = useTransition(items, itemKeys, { ... })
 * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
 */

var guid = 0
var ENTER = 'enter'
var LEAVE = 'leave'
var UPDATE = 'update'

var mapKeys = function mapKeys(items, keys) {
  return (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(
    String
  )
}

var get = function get(props) {
  var items = props.items,
    _props$keys = props.keys,
    keys =
      _props$keys === void 0
        ? function(item) {
            return item
          }
        : _props$keys,
    rest = _objectWithoutPropertiesLoose(props, ['items', 'keys'])

  items = toArray(items !== void 0 ? items : null)
  return _extends(
    {
      items: items,
      keys: mapKeys(items, keys),
    },
    rest
  )
}

function useTransition(input, keyTransform, config) {
  var props = _extends(
    {
      items: input,
      keys:
        keyTransform ||
        function(i) {
          return i
        },
    },
    config
  )

  var _get = get(props),
    _get$lazy = _get.lazy,
    lazy = _get$lazy === void 0 ? false : _get$lazy,
    _get$unique = _get.unique,
    _get$reset = _get.reset,
    reset = _get$reset === void 0 ? false : _get$reset,
    enter = _get.enter,
    leave = _get.leave,
    update = _get.update,
    onDestroyed = _get.onDestroyed,
    keys = _get.keys,
    items = _get.items,
    onFrame = _get.onFrame,
    _onRest = _get.onRest,
    onStart = _get.onStart,
    ref = _get.ref,
    extra = _objectWithoutPropertiesLoose(_get, [
      'lazy',
      'unique',
      'reset',
      'enter',
      'leave',
      'update',
      'onDestroyed',
      'keys',
      'items',
      'onFrame',
      'onRest',
      'onStart',
      'ref',
    ])

  var forceUpdate = useForceUpdate()
  var mounted = React.useRef(false)
  var state = React.useRef({
    mounted: false,
    first: true,
    deleted: [],
    current: {},
    transitions: [],
    prevProps: {},
    paused: !!props.ref,
    instances: !mounted.current && new Map(),
    forceUpdate: forceUpdate,
  })
  React.useImperativeHandle(props.ref, function() {
    return {
      start: function start() {
        return Promise.all(
          Array.from(state.current.instances).map(function(_ref) {
            var c = _ref[1]
            return new Promise(function(r) {
              return c.start(r)
            })
          })
        )
      },
      stop: function stop(finished) {
        return Array.from(state.current.instances).forEach(function(_ref2) {
          var c = _ref2[1]
          return c.stop(finished)
        })
      },

      get controllers() {
        return Array.from(state.current.instances).map(function(_ref3) {
          var c = _ref3[1]
          return c
        })
      },
    }
  }) // Update state

  state.current = diffItems(state.current, props)

  if (state.current.changed) {
    // Update state
    state.current.transitions.forEach(function(transition) {
      var slot = transition.slot,
        from = transition.from,
        to = transition.to,
        config = transition.config,
        trail = transition.trail,
        key = transition.key,
        item = transition.item
      if (!state.current.instances.has(key))
        state.current.instances.set(key, new Controller()) // update the map object

      var ctrl = state.current.instances.get(key)

      var newProps = _extends({}, extra, {
        to: to,
        from: from,
        config: config,
        ref: ref,
        onRest: function onRest(values) {
          if (state.current.mounted) {
            if (transition.destroyed) {
              // If no ref is given delete destroyed items immediately
              if (!ref && !lazy) cleanUp(state, key)
              if (onDestroyed) onDestroyed(item)
            } // A transition comes to rest once all its springs conclude

            var curInstances = Array.from(state.current.instances)
            var active = curInstances.some(function(_ref4) {
              var c = _ref4[1]
              return !c.idle
            })
            if (!active && (ref || lazy) && state.current.deleted.length > 0)
              cleanUp(state)
            if (_onRest) _onRest(item, slot, values)
          }
        },
        onStart:
          onStart &&
          function() {
            return onStart(item, slot)
          },
        onFrame:
          onFrame &&
          function(values) {
            return onFrame(item, slot, values)
          },
        delay: trail,
        reset: reset && slot === ENTER, // Update controller
      })

      ctrl.update(newProps)
      if (!state.current.paused) ctrl.start()
    })
  }

  React.useEffect(function() {
    state.current.mounted = mounted.current = true
    return function() {
      state.current.mounted = mounted.current = false
      Array.from(state.current.instances).map(function(_ref5) {
        var c = _ref5[1]
        return c.destroy()
      })
      state.current.instances.clear()
    }
  }, [])
  return state.current.transitions.map(function(_ref6) {
    var item = _ref6.item,
      slot = _ref6.slot,
      key = _ref6.key
    return {
      item: item,
      key: key,
      state: slot,
      props: state.current.instances.get(key).getValues(),
    }
  })
}

function cleanUp(state, filterKey) {
  var deleted = state.current.deleted

  var _loop = function _loop() {
    if (_isArray) {
      if (_i >= _iterator.length) return 'break'
      _ref8 = _iterator[_i++]
    } else {
      _i = _iterator.next()
      if (_i.done) return 'break'
      _ref8 = _i.value
    }

    var _ref7 = _ref8
    var key = _ref7.key

    var filter = function filter(t) {
      return t.key !== key
    }

    if (is.und(filterKey) || filterKey === key) {
      state.current.instances.delete(key)
      state.current.transitions = state.current.transitions.filter(filter)
      state.current.deleted = state.current.deleted.filter(filter)
    }
  }

  for (
    var _iterator = deleted,
      _isArray = Array.isArray(_iterator),
      _i = 0,
      _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();
    ;

  ) {
    var _ref8

    var _ret = _loop()

    if (_ret === 'break') break
  }

  state.current.forceUpdate()
}

function diffItems(_ref9, props) {
  var first = _ref9.first,
    prevProps = _ref9.prevProps,
    state = _objectWithoutPropertiesLoose(_ref9, ['first', 'prevProps'])

  var _get2 = get(props),
    items = _get2.items,
    keys = _get2.keys,
    initial = _get2.initial,
    from = _get2.from,
    enter = _get2.enter,
    leave = _get2.leave,
    update = _get2.update,
    _get2$trail = _get2.trail,
    trail = _get2$trail === void 0 ? 0 : _get2$trail,
    unique = _get2.unique,
    config = _get2.config,
    _get2$order = _get2.order,
    order = _get2$order === void 0 ? [ENTER, LEAVE, UPDATE] : _get2$order

  var _get3 = get(prevProps),
    _keys = _get3.keys,
    _items = _get3.items

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
  var delay = -trail

  while (order.length) {
    var changeType = order.shift()

    switch (changeType) {
      case ENTER: {
        added.forEach(function(key, index) {
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
          var slot = first && initial !== void 0 ? 'initial' : ENTER
          current[key] = {
            slot: slot,
            originalKey: key,
            key: unique ? String(key) : guid++,
            item: item,
            trail: (delay = delay + trail),
            config: callProp(config, item, slot),
            from: callProp(
              first ? (initial !== void 0 ? initial || {} : from) : from,
              item
            ),
            to: callProp(enter, item),
          }
        })
        break
      }

      case LEAVE: {
        removed.forEach(function(key) {
          var keyIndex = _keys.indexOf(key)

          var item = _items[keyIndex]
          var slot = LEAVE
          deleted.unshift(
            _extends({}, current[key], {
              slot: slot,
              destroyed: true,
              left: _keys[Math.max(0, keyIndex - 1)],
              right: _keys[Math.min(_keys.length, keyIndex + 1)],
              trail: (delay = delay + trail),
              config: callProp(config, item, slot),
              to: callProp(leave, item),
            })
          )
          delete current[key]
        })
        break
      }

      case UPDATE: {
        updated.forEach(function(key) {
          var keyIndex = keys.indexOf(key)
          var item = items[keyIndex]
          var slot = UPDATE
          current[key] = _extends({}, current[key], {
            item: item,
            slot: slot,
            trail: (delay = delay + trail),
            config: callProp(config, item, slot),
            to: callProp(update, item),
          })
        })
        break
      }
    }
  }

  var out = keys.map(function(key) {
    return current[key]
  }) // This tries to restore order for deleted items by finding their last known siblings
  // only using the left sibling to keep order placement consistent for all deleted items

  deleted.forEach(function(_ref10) {
    var left = _ref10.left,
      right = _ref10.right,
      item = _objectWithoutPropertiesLoose(_ref10, ['left', 'right'])

    var pos // Was it the element on the left, if yes, move there ...

    if (
      (pos = out.findIndex(function(t) {
        return t.originalKey === left
      })) !== -1
    )
      pos += 1 // And if nothing else helps, move it to the start ¯\_(ツ)_/¯

    pos = Math.max(0, pos)
    out = [].concat(out.slice(0, pos), [item], out.slice(pos))
  })
  return _extends({}, state, {
    changed: added.length || removed.length || updated.length,
    first: first && added.length === 0,
    transitions: out,
    current: current,
    deleted: deleted,
    prevProps: props,
  })
}

var AnimatedStyle =
  /*#__PURE__*/
  (function(_AnimatedObject) {
    _inheritsLoose(AnimatedStyle, _AnimatedObject)

    function AnimatedStyle(style) {
      var _this

      if (style === void 0) {
        style = {}
      }

      _this = _AnimatedObject.call(this) || this

      if (style.transform && !(style.transform instanceof Animated)) {
        style = applyAnimatedValues.transform(style)
      }

      _this.payload = style
      return _this
    }

    return AnimatedStyle
  })(AnimatedObject)

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
  for (
    var _len = arguments.length, parts = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    parts[_key] = arguments[_key]
  }

  return '\\(\\s*(' + parts.join(')\\s*,\\s*(') + ')\\s*\\)'
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

var createStringInterpolator = function createStringInterpolator(config) {
  // Replace colors with rgba
  var outputRange = config.output
    .map(function(rangeValue) {
      return rangeValue.replace(colorRegex, colorToRgba)
    })
    .map(function(rangeValue) {
      return rangeValue.replace(colorNamesRegex, colorToRgba)
    })
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
    .map(function(_value, i) {
      return createInterpolator(
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

var isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
}

var prefixKey = function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1)
}

var prefixes = ['Webkit', 'Ms', 'Moz', 'O']
isUnitlessNumber = Object.keys(isUnitlessNumber).reduce(function(acc, prop) {
  prefixes.forEach(function(prefix) {
    return (acc[prefixKey(prefix, prop)] = acc[prop])
  })
  return acc
}, isUnitlessNumber)

function dangerousStyleValue(name, value, isCustomProperty) {
  if (value == null || typeof value === 'boolean' || value === '') return ''
  if (
    !isCustomProperty &&
    typeof value === 'number' &&
    value !== 0 &&
    !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])
  )
    return value + 'px' // Presumes implicit 'px' suffix for unitless numbers

  return ('' + value).trim()
}

var attributeCache = {}
injectCreateAnimatedStyle(function(style) {
  return new AnimatedStyle(style)
})
injectDefaultElement('div')
injectStringInterpolator(createStringInterpolator)
injectColorNames(colors)
injectApplyAnimatedValues(
  function(instance, props) {
    if (instance.nodeType && instance.setAttribute !== undefined) {
      var style = props.style,
        children = props.children,
        scrollTop = props.scrollTop,
        scrollLeft = props.scrollLeft,
        attributes = _objectWithoutPropertiesLoose(props, [
          'style',
          'children',
          'scrollTop',
          'scrollLeft',
        ])

      var filter =
        instance.nodeName === 'filter' ||
        (instance.parentNode && instance.parentNode.nodeName === 'filter')
      if (scrollTop !== void 0) instance.scrollTop = scrollTop
      if (scrollLeft !== void 0) instance.scrollLeft = scrollLeft // Set textContent, if children is an animatable value

      if (children !== void 0) instance.textContent = children // Set styles ...

      for (var styleName in style) {
        if (!style.hasOwnProperty(styleName)) continue
        var isCustomProperty = styleName.indexOf('--') === 0
        var styleValue = dangerousStyleValue(
          styleName,
          style[styleName],
          isCustomProperty
        )
        if (styleName === 'float') styleName = 'cssFloat'
        if (isCustomProperty) instance.style.setProperty(styleName, styleValue)
        else instance.style[styleName] = styleValue
      } // Set attributes ...

      for (var name in attributes) {
        // Attributes are written in dash case
        var dashCase = filter
          ? name
          : attributeCache[name] ||
            (attributeCache[name] = name.replace(/([A-Z])/g, function(n) {
              return '-' + n.toLowerCase()
            }))
        if (typeof instance.getAttribute(dashCase) !== 'undefined')
          instance.setAttribute(dashCase, attributes[name])
      }

      return
    } else return false
  },
  function(style) {
    return style
  }
)

var domElements = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr', // SVG
  'circle',
  'clipPath',
  'defs',
  'ellipse',
  'foreignObject',
  'g',
  'image',
  'line',
  'linearGradient',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'text',
  'tspan',
]
// Extend animated with all the available THREE elements
var apply = merge(createAnimatedComponent, false)
var extendedAnimated = apply(domElements)

exports.apply = apply
exports.config = config
exports.update = update
exports.animated = extendedAnimated
exports.a = extendedAnimated
exports.interpolate = interpolate$1
exports.Globals = Globals
exports.useSpring = useSpring
exports.useTrail = useTrail
exports.useTransition = useTransition
exports.useChain = useChain
exports.useSprings = useSprings
