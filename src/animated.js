import react from 'react';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var REACT_ELEMENT_TYPE;

function _jsx(type, props, key, children) {
  if (!REACT_ELEMENT_TYPE) {
    REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  }

  var defaultProps = type && type.defaultProps;
  var childrenLength = arguments.length - 3;

  if (!props && childrenLength !== 0) {
    props = {
      children: void 0
    };
  }

  if (props && defaultProps) {
    for (var propName in defaultProps) {
      if (props[propName] === void 0) {
        props[propName] = defaultProps[propName];
      }
    }
  } else if (!props) {
    props = defaultProps || {};
  }

  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = new Array(childrenLength);

    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 3];
    }

    props.children = childArray;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key === undefined ? null : '' + key,
    ref: null,
    props: props,
    _owner: null
  };
}

function _asyncIterator(iterable) {
  if (typeof Symbol === "function") {
    if (Symbol.asyncIterator) {
      var method = iterable[Symbol.asyncIterator];
      if (method != null) return method.call(iterable);
    }

    if (Symbol.iterator) {
      return iterable[Symbol.iterator]();
    }
  }

  throw new TypeError("Object is not async iterable");
}

function _AwaitValue(value) {
  this.wrapped = value;
}

function _AsyncGenerator(gen) {
  var front, back;

  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };

      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }

  function resume(key, arg) {
    try {
      var result = gen[key](arg);
      var value = result.value;
      var wrappedAwait = value instanceof _AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume("next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }

  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;

      case "throw":
        front.reject(value);
        break;

      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }

    front = front.next;

    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }

  this._invoke = send;

  if (typeof gen.return !== "function") {
    this.return = undefined;
  }
}

if (typeof Symbol === "function" && Symbol.asyncIterator) {
  _AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
    return this;
  };
}

_AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

_AsyncGenerator.prototype.throw = function (arg) {
  return this._invoke("throw", arg);
};

_AsyncGenerator.prototype.return = function (arg) {
  return this._invoke("return", arg);
};

function _wrapAsyncGenerator(fn) {
  return function () {
    return new _AsyncGenerator(fn.apply(this, arguments));
  };
}

function _awaitAsyncGenerator(value) {
  return new _AwaitValue(value);
}

function _asyncGeneratorDelegate(inner, awaitWrap) {
  var iter = {},
      waiting = false;

  function pump(key, value) {
    waiting = true;
    value = new Promise(function (resolve) {
      resolve(inner[key](value));
    });
    return {
      done: false,
      value: awaitWrap(value)
    };
  }

  if (typeof Symbol === "function" && Symbol.iterator) {
    iter[Symbol.iterator] = function () {
      return this;
    };
  }

  iter.next = function (value) {
    if (waiting) {
      waiting = false;
      return value;
    }

    return pump("next", value);
  };

  if (typeof inner.throw === "function") {
    iter.throw = function (value) {
      if (waiting) {
        waiting = false;
        throw value;
      }

      return pump("throw", value);
    };
  }

  if (typeof inner.return === "function") {
    iter.return = function (value) {
      return pump("return", value);
    };
  }

  return iter;
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(_next, _throw);
        }
      }

      function _next(value) {
        step("next", value);
      }

      function _throw(err) {
        step("throw", err);
      }

      _next();
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineEnumerableProperties(obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  if (Object.getOwnPropertySymbols) {
    var objectSymbols = Object.getOwnPropertySymbols(descs);

    for (var i = 0; i < objectSymbols.length; i++) {
      var sym = objectSymbols[i];
      var desc = descs[sym];
      desc.configurable = desc.enumerable = true;
      if ("value" in desc) desc.writable = true;
      Object.defineProperty(obj, sym, desc);
    }
  }

  return obj;
}

function _defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return _get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var _gPO = Object.getPrototypeOf || function _gPO(o) {
  return o.__proto__;
};

var _sPO = Object.setPrototypeOf || function _sPO(o, p) {
  o.__proto__ = p;
  return o;
};

var _construct = typeof Reflect === "object" && Reflect.construct || function _construct(Parent, args, Class) {
  var Constructor,
      a = [null];
  a.push.apply(a, args);
  Constructor = Parent.bind.apply(Parent, a);
  return _sPO(new Constructor(), Class.prototype);
};

var _cache = typeof Map === "function" && new Map();

function _wrapNativeSuper(Class) {
  if (typeof Class !== "function") {
    throw new TypeError("Super expression must either be null or a function");
  }

  if (typeof _cache !== "undefined") {
    if (_cache.has(Class)) return _cache.get(Class);

    _cache.set(Class, Wrapper);
  }

  function Wrapper() {}

  Wrapper.prototype = Object.create(Class.prototype, {
    constructor: {
      value: Wrapper,
      enumerable: false,
      writeable: true,
      configurable: true
    }
  });
  return _sPO(Wrapper, _sPO(function Super() {
    return _construct(Class, arguments, _gPO(this).constructor);
  }, Class));
}

function _instanceof(left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }

    newObj.default = obj;
    return newObj;
  }
}

function _newArrowCheck(innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
}

function _objectDestructuringEmpty(obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      _set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
}

function _sliceIterator(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    return _sliceIterator(arr, i);
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
}

function _slicedToArrayLoose(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
}

function _taggedTemplateLiteral(strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _taggedTemplateLiteralLoose(strings, raw) {
  strings.raw = raw;
  return strings;
}

function _temporalRef(val, name) {
  if (val === _temporalUndefined) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  } else {
    return val;
  }
}

function _readOnlyError(name) {
  throw new Error("\"" + name + "\" is read-only");
}

function _classNameTDZError(name) {
  throw new Error("Class \"" + name + "\" cannot be referenced in computed property keys.");
}

var _temporalUndefined = {};

function _toArray(arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
}

function _skipFirstGeneratorNext(fn) {
  return function () {
    var it = fn.apply(this, arguments);
    it.next();
    return it;
  };
}

function _toPropertyKey(key) {
  if (typeof key === "symbol") {
    return key;
  } else {
    return String(key);
  }
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.');
}

function _initializerDefineProperty(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var rollupPluginBabelHelpers = Object.freeze({
	get typeof () { return _typeof; },
	jsx: _jsx,
	asyncIterator: _asyncIterator,
	AwaitValue: _AwaitValue,
	AsyncGenerator: _AsyncGenerator,
	wrapAsyncGenerator: _wrapAsyncGenerator,
	awaitAsyncGenerator: _awaitAsyncGenerator,
	asyncGeneratorDelegate: _asyncGeneratorDelegate,
	asyncToGenerator: _asyncToGenerator,
	classCallCheck: _classCallCheck,
	createClass: _createClass,
	defineEnumerableProperties: _defineEnumerableProperties,
	defaults: _defaults,
	defineProperty: _defineProperty,
	get extends () { return _extends; },
	get: _get,
	inherits: _inherits,
	inheritsLoose: _inheritsLoose,
	wrapNativeSuper: _wrapNativeSuper,
	instanceof: _instanceof,
	interopRequireDefault: _interopRequireDefault,
	interopRequireWildcard: _interopRequireWildcard,
	newArrowCheck: _newArrowCheck,
	objectDestructuringEmpty: _objectDestructuringEmpty,
	objectWithoutProperties: _objectWithoutProperties,
	assertThisInitialized: _assertThisInitialized,
	possibleConstructorReturn: _possibleConstructorReturn,
	set: _set,
	slicedToArray: _slicedToArray,
	slicedToArrayLoose: _slicedToArrayLoose,
	taggedTemplateLiteral: _taggedTemplateLiteral,
	taggedTemplateLiteralLoose: _taggedTemplateLiteralLoose,
	temporalRef: _temporalRef,
	readOnlyError: _readOnlyError,
	classNameTDZError: _classNameTDZError,
	temporalUndefined: _temporalUndefined,
	toArray: _toArray,
	toConsumableArray: _toConsumableArray,
	skipFirstGeneratorNext: _skipFirstGeneratorNext,
	toPropertyKey: _toPropertyKey,
	initializerWarningHelper: _initializerWarningHelper,
	initializerDefineProperty: _initializerDefineProperty,
	applyDecoratedDescriptor: _applyDecoratedDescriptor
});

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var NODE_ENV = process.env.NODE_ENV;

var invariant = function invariant(condition, format, a, b, c, d, e, f) {
  if (NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;

    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame

    throw error;
  }
};

var invariant_1 = invariant;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */
// support them yet

var Animated =
/*#__PURE__*/
function () {
  function Animated() {}

  var _proto = Animated.prototype;

  _proto.__attach = function __attach() {};

  _proto.__detach = function __detach() {};

  _proto.__getValue = function __getValue() {};

  _proto.__getAnimatedValue = function __getAnimatedValue() {
    return this.__getValue();
  };

  _proto.__addChild = function __addChild(child) {};

  _proto.__removeChild = function __removeChild(child) {};

  _proto.__getChildren = function __getChildren() {
    return [];
  };

  return Animated;
}();

var Animated_1 = Animated;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var require$$0 = ( rollupPluginBabelHelpers && undefined ) || rollupPluginBabelHelpers;

var _inheritsLoose$1 =
/*#__PURE__*/
require$$0.inheritsLoose;



var AnimatedWithChildren =
/*#__PURE__*/
function (_Animated) {
  _inheritsLoose$1(AnimatedWithChildren, _Animated);

  function AnimatedWithChildren() {
    var _this;

    _this = _Animated.call(this) || this;
    _this._children = [];
    return _this;
  }

  var _proto = AnimatedWithChildren.prototype;

  _proto.__addChild = function __addChild(child) {
    if (this._children.length === 0) {
      this.__attach();
    }

    this._children.push(child);
  };

  _proto.__removeChild = function __removeChild(child) {
    var index = this._children.indexOf(child);

    if (index === -1) {
      console.warn('Trying to remove a child that doesn\'t exist');
      return;
    }

    this._children.splice(index, 1);

    if (this._children.length === 0) {
      this.__detach();
    }
  };

  _proto.__getChildren = function __getChildren() {
    return this._children;
  };

  return AnimatedWithChildren;
}(Animated_1);

var AnimatedWithChildren_1 = AnimatedWithChildren;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var InteractionManager = {
  current: {
    createInteractionHandle: function createInteractionHandle() {},
    clearInteractionHandle: function clearInteractionHandle() {}
  },
  inject: function inject(manager) {
    InteractionManager.current = manager;
  }
};
var InteractionManager_1 = InteractionManager;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
function normalizeColor(color) {
  var match;

  if (typeof color === 'number') {
    if (color >>> 0 === color && color >= 0 && color <= 0xffffffff) {
      return color;
    }

    return null;
  } // Ordered based on occurrences on Facebook codebase


  if (match = matchers.hex6.exec(color)) {
    return parseInt(match[1] + 'ff', 16) >>> 0;
  }

  if (names.hasOwnProperty(color)) {
    return names[color];
  }

  if (match = matchers.rgb.exec(color)) {
    return (parse255(match[1]) << 24 | // r
    parse255(match[2]) << 16 | // g
    parse255(match[3]) << 8 | // b
    0x000000ff // a
    ) >>> 0;
  }

  if (match = matchers.rgba.exec(color)) {
    return (parse255(match[1]) << 24 | // r
    parse255(match[2]) << 16 | // g
    parse255(match[3]) << 8 | // b
    parse1(match[4]) // a
    ) >>> 0;
  }

  if (match = matchers.hex3.exec(color)) {
    return parseInt(match[1] + match[1] + // r
    match[2] + match[2] + // g
    match[3] + match[3] + // b
    'ff', // a
    16) >>> 0;
  } // https://drafts.csswg.org/css-color-4/#hex-notation


  if (match = matchers.hex8.exec(color)) {
    return parseInt(match[1], 16) >>> 0;
  }

  if (match = matchers.hex4.exec(color)) {
    return parseInt(match[1] + match[1] + // r
    match[2] + match[2] + // g
    match[3] + match[3] + // b
    match[4] + match[4], // a
    16) >>> 0;
  }

  if (match = matchers.hsl.exec(color)) {
    return (hslToRgb(parse360(match[1]), // h
    parsePercentage(match[2]), // s
    parsePercentage(match[3]) // l
    ) | 0x000000ff // a
    ) >>> 0;
  }

  if (match = matchers.hsla.exec(color)) {
    return (hslToRgb(parse360(match[1]), // h
    parsePercentage(match[2]), // s
    parsePercentage(match[3]) // l
    ) | parse1(match[4]) // a
    ) >>> 0;
  }

  return null;
}

function hue2rgb(p, q, t) {
  if (t < 0) {
    t += 1;
  }

  if (t > 1) {
    t -= 1;
  }

  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }

  if (t < 1 / 2) {
    return q;
  }

  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }

  return p;
}

function hslToRgb(h, s, l) {
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  var r = hue2rgb(p, q, h + 1 / 3);
  var g = hue2rgb(p, q, h);
  var b = hue2rgb(p, q, h - 1 / 3);
  return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b * 255) << 8;
} // var INTEGER = '[-+]?\\d+';


var NUMBER = '[-+]?\\d*\\.?\\d+';
var PERCENTAGE = NUMBER + '%';

function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike, 0);
}

function call() {
  return '\\(\\s*(' + toArray(arguments).join(')\\s*,\\s*(') + ')\\s*\\)';
}

var matchers = {
  rgb:
  /*#__PURE__*/
  new RegExp('rgb' +
  /*#__PURE__*/
  call(NUMBER, NUMBER, NUMBER)),
  rgba:
  /*#__PURE__*/
  new RegExp('rgba' +
  /*#__PURE__*/
  call(NUMBER, NUMBER, NUMBER, NUMBER)),
  hsl:
  /*#__PURE__*/
  new RegExp('hsl' +
  /*#__PURE__*/
  call(NUMBER, PERCENTAGE, PERCENTAGE)),
  hsla:
  /*#__PURE__*/
  new RegExp('hsla' +
  /*#__PURE__*/
  call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)),
  hex3: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
  hex4: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
  hex6: /^#([0-9a-fA-F]{6})$/,
  hex8: /^#([0-9a-fA-F]{8})$/
};

function parse255(str) {
  var int = parseInt(str, 10);

  if (int < 0) {
    return 0;
  }

  if (int > 255) {
    return 255;
  }

  return int;
}

function parse360(str) {
  var int = parseFloat(str);
  return (int % 360 + 360) % 360 / 360;
}

function parse1(str) {
  var num = parseFloat(str);

  if (num < 0) {
    return 0;
  }

  if (num > 1) {
    return 255;
  }

  return Math.round(num * 255);
}

function parsePercentage(str) {
  // parseFloat conveniently ignores the final %
  var int = parseFloat(str, 10);

  if (int < 0) {
    return 0;
  }

  if (int > 100) {
    return 1;
  }

  return int / 100;
}

var names = {
  transparent: 0x00000000,
  // http://www.w3.org/TR/css3-color/#svg-color
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
  yellowgreen: 0x9acd32ff
};

function rgba(colorInt) {
  var r = Math.round((colorInt & 0xff000000) >>> 24);
  var g = Math.round((colorInt & 0x00ff0000) >>> 16);
  var b = Math.round((colorInt & 0x0000ff00) >>> 8);
  var a = ((colorInt & 0x000000ff) >>> 0) / 255;
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}
normalizeColor.rgba = rgba;
var normalizeCssColor = normalizeColor;

var _extends$1 =
/*#__PURE__*/
require$$0.extends;





var linear = function linear(t) {
  return t;
};
/**
 * Very handy helper to map input ranges to output ranges with an easing
 * function and custom behavior outside of the ranges.
 */


var Interpolation =
/*#__PURE__*/
function () {
  function Interpolation() {}

  Interpolation.create = function create(config) {
    if (config.outputRange && typeof config.outputRange[0] === 'string') {
      return createInterpolationFromStringOutputRange(config);
    }

    var outputRange = config.outputRange;
    checkInfiniteRange('outputRange', outputRange);
    var inputRange = config.inputRange;
    checkInfiniteRange('inputRange', inputRange);
    checkValidInputRange(inputRange);
    invariant_1(inputRange.length === outputRange.length, 'inputRange (' + inputRange.length + ') and outputRange (' + outputRange.length + ') must have the same length');
    var easing = config.easing || linear;
    var extrapolateLeft = 'extend';

    if (config.extrapolateLeft !== undefined) {
      extrapolateLeft = config.extrapolateLeft;
    } else if (config.extrapolate !== undefined) {
      extrapolateLeft = config.extrapolate;
    }

    var extrapolateRight = 'extend';

    if (config.extrapolateRight !== undefined) {
      extrapolateRight = config.extrapolateRight;
    } else if (config.extrapolate !== undefined) {
      extrapolateRight = config.extrapolate;
    }

    return function (input) {
      invariant_1(typeof input === 'number', 'Cannot interpolation an input which is not a number');
      var range = findRange(input, inputRange);
      return interpolate(input, inputRange[range], inputRange[range + 1], outputRange[range], outputRange[range + 1], easing, extrapolateLeft, extrapolateRight);
    };
  };

  return Interpolation;
}();

function interpolate(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight) {
  var result = input; // Extrapolate

  if (result < inputMin) {
    if (extrapolateLeft === 'identity') {
      return result;
    } else if (extrapolateLeft === 'clamp') {
      result = inputMin;
    } else if (extrapolateLeft === 'extend') {// noop
    }
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') {
      return result;
    } else if (extrapolateRight === 'clamp') {
      result = inputMax;
    } else if (extrapolateRight === 'extend') {// noop
    }
  }

  if (outputMin === outputMax) {
    return outputMin;
  }

  if (inputMin === inputMax) {
    if (input <= inputMin) {
      return outputMin;
    }

    return outputMax;
  } // Input Range


  if (inputMin === -Infinity) {
    result = -result;
  } else if (inputMax === Infinity) {
    result = result - inputMin;
  } else {
    result = (result - inputMin) / (inputMax - inputMin);
  } // Easing


  result = easing(result); // Output Range

  if (outputMin === -Infinity) {
    result = -result;
  } else if (outputMax === Infinity) {
    result = result + outputMin;
  } else {
    result = result * (outputMax - outputMin) + outputMin;
  }

  return result;
}

function colorToRgba(input) {
  var int32Color = normalizeCssColor(input);

  if (int32Color === null) {
    return input;
  }

  int32Color = int32Color || 0; // $FlowIssue

  var r = (int32Color & 0xff000000) >>> 24;
  var g = (int32Color & 0x00ff0000) >>> 16;
  var b = (int32Color & 0x0000ff00) >>> 8;
  var a = (int32Color & 0x000000ff) / 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

var stringShapeRegex = /[0-9\.-]+/g;
/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36) // colors
 *   -45deg                  // values with units
 */

function createInterpolationFromStringOutputRange(config) {
  var outputRange = config.outputRange;
  invariant_1(outputRange.length >= 2, 'Bad output range');
  outputRange = outputRange.map(colorToRgba);
  checkPattern(outputRange); // ['rgba(0, 100, 200, 0)', 'rgba(50, 150, 250, 0.5)']
  // ->
  // [
  //   [0, 50],
  //   [100, 150],
  //   [200, 250],
  //   [0, 0.5],
  // ]

  /* $FlowFixMe(>=0.18.0): `outputRange[0].match()` can return `null`. Need to
   * guard against this possibility.
   */

  var outputRanges = outputRange[0].match(stringShapeRegex).map(function () {
    return [];
  });
  outputRange.forEach(function (value) {
    /* $FlowFixMe(>=0.18.0): `value.match()` can return `null`. Need to guard
     * against this possibility.
     */
    value.match(stringShapeRegex).forEach(function (number, i) {
      outputRanges[i].push(+number);
    });
  });
  /* $FlowFixMe(>=0.18.0): `outputRange[0].match()` can return `null`. Need to
   * guard against this possibility.
   */

  var interpolations = outputRange[0].match(stringShapeRegex).map(function (value, i) {
    return Interpolation.create(_extends$1({}, config, {
      outputRange: outputRanges[i]
    }));
  }); // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
  // round the opacity (4th column).

  var shouldRound = /^rgb/.test(outputRange[0]);
  return function (input) {
    var i = 0; // 'rgba(0, 100, 200, 0)'
    // ->
    // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'

    return outputRange[0].replace(stringShapeRegex, function () {
      var val = interpolations[i++](input);
      return String(shouldRound && i < 4 ? Math.round(val) : val);
    });
  };
}

function checkPattern(arr) {
  var pattern = arr[0].replace(stringShapeRegex, '');

  for (var i = 1; i < arr.length; ++i) {
    invariant_1(pattern === arr[i].replace(stringShapeRegex, ''), 'invalid pattern ' + arr[0] + ' and ' + arr[i]);
  }
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i) {
    if (inputRange[i] >= input) {
      break;
    }
  }

  return i - 1;
}

function checkValidInputRange(arr) {
  invariant_1(arr.length >= 2, 'inputRange must have at least 2 elements');

  for (var i = 1; i < arr.length; ++i) {
    invariant_1(arr[i] >= arr[i - 1],
    /* $FlowFixMe(>=0.13.0) - In the addition expression below this comment,
     * one or both of the operands may be something that doesn't cleanly
     * convert to a string, like undefined, null, and object, etc. If you really
     * mean this implicit string conversion, you can do something like
     * String(myThing)
     */
    'inputRange must be monotonically increasing ' + arr);
  }
}

function checkInfiniteRange(name, arr) {
  invariant_1(arr.length >= 2, name + ' must have at least 2 elements');
  invariant_1(arr.length !== 2 || arr[0] !== -Infinity || arr[1] !== Infinity,
  /* $FlowFixMe(>=0.13.0) - In the addition expression below this comment,
   * one or both of the operands may be something that doesn't cleanly convert
   * to a string, like undefined, null, and object, etc. If you really mean
   * this implicit string conversion, you can do something like
   * String(myThing)
   */
  name + 'cannot be ]-infinity;+infinity[ ' + arr);
}

var Interpolation_1 = Interpolation;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var _uniqueId = 0;

var guid$1 = function uniqueId() {
  return String(_uniqueId++);
};

var _inheritsLoose$2 =
/*#__PURE__*/
require$$0.inheritsLoose;











var AnimatedInterpolation =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$2(AnimatedInterpolation, _AnimatedWithChildren);

  function AnimatedInterpolation(parent, interpolation) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._parent = parent;
    _this._interpolation = interpolation;
    _this._listeners = {};
    return _this;
  }

  var _proto = AnimatedInterpolation.prototype;

  _proto.__getValue = function __getValue() {
    var parentValue = this._parent.__getValue();

    invariant_1(typeof parentValue === 'number', 'Cannot interpolate an input which is not a number.');
    return this._interpolation(parentValue);
  };

  _proto.addListener = function addListener(callback) {
    var _this2 = this;

    if (!this._parentListener) {
      this._parentListener = this._parent.addListener(function () {
        for (var key in _this2._listeners) {
          _this2._listeners[key]({
            value: _this2.__getValue()
          });
        }
      });
    }

    var id = guid$1();
    this._listeners[id] = callback;
    return id;
  };

  _proto.removeListener = function removeListener(id) {
    delete this._listeners[id];
  };

  _proto.interpolate = function interpolate(config) {
    return new AnimatedInterpolation(this, Interpolation_1.create(config));
  };

  _proto.__attach = function __attach() {
    this._parent.__addChild(this);
  };

  _proto.__detach = function __detach() {
    this._parent.__removeChild(this);

    this._parentListener = this._parent.removeListener(this._parentListener);
  };

  return AnimatedInterpolation;
}(AnimatedWithChildren_1);

var AnimatedInterpolation_1 = AnimatedInterpolation;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

// Important note: start() and stop() will only be called at most once.
// Once an animation has been stopped or finished its course, it will
// not be reused.
var Animation =
/*#__PURE__*/
function () {
  function Animation() {}

  var _proto = Animation.prototype;

  _proto.start = function start(fromValue, onUpdate, onEnd, previousAnimation) {};

  _proto.stop = function stop() {}; // Helper function for subclasses to make sure onEnd is only called once.


  _proto.__debouncedOnEnd = function __debouncedOnEnd(result) {
    var onEnd = this.__onEnd;
    this.__onEnd = null;
    onEnd && onEnd(result);
  };

  return Animation;
}();

var Animation_1 = Animation;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

function SetPolyfill() {
  this._cache = [];
}

SetPolyfill.prototype.add = function (e) {
  if (this._cache.indexOf(e) === -1) {
    this._cache.push(e);
  }
};

SetPolyfill.prototype.forEach = function (cb) {
  this._cache.forEach(cb);
};

var SetPolyfill_1 = SetPolyfill;

var _inheritsLoose$3 =
/*#__PURE__*/
require$$0.inheritsLoose;













var Set = commonjsGlobal.Set ||
/*#__PURE__*/
SetPolyfill_1;

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
function _flush(rootNode) {
  var animatedStyles = new Set();

  function findAnimatedStyles(node) {
    if (typeof node.update === 'function') {
      animatedStyles.add(node);
    } else {
      node.__getChildren().forEach(findAnimatedStyles);
    }
  }

  findAnimatedStyles(rootNode);
  animatedStyles.forEach(function (animatedStyle) {
    return animatedStyle.update();
  });
}
/**
 * Standard value for driving animations.  One `Animated.Value` can drive
 * multiple properties in a synchronized fashion, but can only be driven by one
 * mechanism at a time.  Using a new mechanism (e.g. starting a new animation,
 * or calling `setValue`) will stop any previous ones.
 */


var AnimatedValue =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$3(AnimatedValue, _AnimatedWithChildren);

  function AnimatedValue(value) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._value = value;
    _this._offset = 0;
    _this._animation = null;
    _this._listeners = {};
    return _this;
  }

  var _proto = AnimatedValue.prototype;

  _proto.__detach = function __detach() {
    this.stopAnimation();
  };

  _proto.__getValue = function __getValue() {
    return this._value + this._offset;
  };
  /**
   * Directly set the value.  This will stop any animations running on the value
   * and update all the bound properties.
   */


  _proto.setValue = function setValue(value) {
    if (this._animation) {
      this._animation.stop();

      this._animation = null;
    }

    this._updateValue(value);
  };
  /**
   * Sets an offset that is applied on top of whatever value is set, whether via
   * `setValue`, an animation, or `Animated.event`.  Useful for compensating
   * things like the start of a pan gesture.
   */


  _proto.setOffset = function setOffset(offset) {
    this._offset = offset;
  };
  /**
   * Merges the offset value into the base value and resets the offset to zero.
   * The final output of the value is unchanged.
   */


  _proto.flattenOffset = function flattenOffset() {
    this._value += this._offset;
    this._offset = 0;
  };
  /**
   * Adds an asynchronous listener to the value so you can observe updates from
   * animations.  This is useful because there is no way to
   * synchronously read the value because it might be driven natively.
   */


  _proto.addListener = function addListener(callback) {
    var id = guid$1();
    this._listeners[id] = callback;
    return id;
  };

  _proto.removeListener = function removeListener(id) {
    delete this._listeners[id];
  };

  _proto.removeAllListeners = function removeAllListeners() {
    this._listeners = {};
  };
  /**
   * Stops any running animation or tracking.  `callback` is invoked with the
   * final value after stopping the animation, which is useful for updating
   * state to match the animation position with layout.
   */


  _proto.stopAnimation = function stopAnimation(callback) {
    this.stopTracking();
    this._animation && this._animation.stop();
    this._animation = null;
    callback && callback(this.__getValue());
  };
  /**
   * Interpolates the value before updating the property, e.g. mapping 0-1 to
   * 0-10.
   */


  _proto.interpolate = function interpolate(config) {
    return new AnimatedInterpolation_1(this, Interpolation_1.create(config));
  };
  /**
   * Typically only used internally, but could be used by a custom Animation
   * class.
   */


  _proto.animate = function animate(animation, callback) {
    var _this2 = this;

    var handle = null;

    if (animation.__isInteraction) {
      handle = InteractionManager_1.current.createInteractionHandle();
    }

    var previousAnimation = this._animation;
    this._animation && this._animation.stop();
    this._animation = animation;
    animation.start(this._value, function (value) {
      _this2._updateValue(value);
    }, function (result) {
      _this2._animation = null;

      if (handle !== null) {
        InteractionManager_1.current.clearInteractionHandle(handle);
      }

      callback && callback(result);
    }, previousAnimation);
  };
  /**
   * Typically only used internally.
   */


  _proto.stopTracking = function stopTracking() {
    this._tracking && this._tracking.__detach();
    this._tracking = null;
  };
  /**
   * Typically only used internally.
   */


  _proto.track = function track(tracking) {
    this.stopTracking();
    this._tracking = tracking;
  };

  _proto._updateValue = function _updateValue(value) {
    this._value = value;

    _flush(this);

    for (var key in this._listeners) {
      this._listeners[key]({
        value: this.__getValue()
      });
    }
  };

  return AnimatedValue;
}(AnimatedWithChildren_1);

var AnimatedValue_1 = AnimatedValue;

var _inheritsLoose$4 =
/*#__PURE__*/
require$$0.inheritsLoose;











/**
 * 2D Value for driving 2D animations, such as pan gestures.  Almost identical
 * API to normal `Animated.Value`, but multiplexed.  Contains two regular
 * `Animated.Value`s under the hood.  Example:
 *
 *```javascript
 *  class DraggableView extends React.Component {
 *    constructor(props) {
 *      super(props);
 *      this.state = {
 *        pan: new Animated.ValueXY(), // inits to zero
 *      };
 *      this.state.panResponder = PanResponder.create({
 *        onStartShouldSetPanResponder: () => true,
 *        onPanResponderMove: Animated.event([null, {
 *          dx: this.state.pan.x, // x,y are Animated.Value
 *          dy: this.state.pan.y,
 *        }]),
 *        onPanResponderRelease: () => {
 *          Animated.spring(
 *            this.state.pan,         // Auto-multiplexed
 *            {toValue: {x: 0, y: 0}} // Back to zero
 *          ).start();
 *        },
 *      });
 *    }
 *    render() {
 *      return (
 *        <Animated.View
 *          {...this.state.panResponder.panHandlers}
 *          style={this.state.pan.getLayout()}>
 *          {this.props.children}
 *        </Animated.View>
 *      );
 *    }
 *  }
 *```
 */
var AnimatedValueXY =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$4(AnimatedValueXY, _AnimatedWithChildren);

  function AnimatedValueXY(valueIn) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    var value = valueIn || {
      x: 0,
      y: 0
    }; // fixme: shouldn't need `: any`

    if (typeof value.x === 'number' && typeof value.y === 'number') {
      _this.x = new AnimatedValue_1(value.x);
      _this.y = new AnimatedValue_1(value.y);
    } else {
      invariant_1(value.x instanceof AnimatedValue_1 && value.y instanceof AnimatedValue_1, 'AnimatedValueXY must be initalized with an object of numbers or ' + 'AnimatedValues.');
      _this.x = value.x;
      _this.y = value.y;
    }

    _this._listeners = {};
    return _this;
  }

  var _proto = AnimatedValueXY.prototype;

  _proto.setValue = function setValue(value) {
    this.x.setValue(value.x);
    this.y.setValue(value.y);
  };

  _proto.setOffset = function setOffset(offset) {
    this.x.setOffset(offset.x);
    this.y.setOffset(offset.y);
  };

  _proto.flattenOffset = function flattenOffset() {
    this.x.flattenOffset();
    this.y.flattenOffset();
  };

  _proto.__getValue = function __getValue() {
    return {
      x: this.x.__getValue(),
      y: this.y.__getValue()
    };
  };

  _proto.stopAnimation = function stopAnimation(callback) {
    this.x.stopAnimation();
    this.y.stopAnimation();
    callback && callback(this.__getValue());
  };

  _proto.addListener = function addListener(callback) {
    var _this2 = this;

    var id = guid$1();

    var jointCallback = function jointCallback(_ref) {
      var number = _ref.value;
      callback(_this2.__getValue());
    };

    this._listeners[id] = {
      x: this.x.addListener(jointCallback),
      y: this.y.addListener(jointCallback)
    };
    return id;
  };

  _proto.removeListener = function removeListener(id) {
    this.x.removeListener(this._listeners[id].x);
    this.y.removeListener(this._listeners[id].y);
    delete this._listeners[id];
  };
  /**
   * Converts `{x, y}` into `{left, top}` for use in style, e.g.
   *
   *```javascript
   *  style={this.state.anim.getLayout()}
   *```
   */


  _proto.getLayout = function getLayout() {
    return {
      left: this.x,
      top: this.y
    };
  };
  /**
   * Converts `{x, y}` into a useable translation transform, e.g.
   *
   *```javascript
   *  style={{
   *    transform: this.state.anim.getTranslateTransform()
   *  }}
   *```
   */


  _proto.getTranslateTransform = function getTranslateTransform() {
    return [{
      translateX: this.x
    }, {
      translateY: this.y
    }];
  };

  return AnimatedValueXY;
}(AnimatedWithChildren_1);

var AnimatedValueXY_1 = AnimatedValueXY;

var _inheritsLoose$5 =
/*#__PURE__*/
require$$0.inheritsLoose;











var AnimatedAddition =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$5(AnimatedAddition, _AnimatedWithChildren);

  function AnimatedAddition(a, b) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._a = typeof a === 'number' ? new AnimatedValue_1(a) : a;
    _this._b = typeof b === 'number' ? new AnimatedValue_1(b) : b;
    _this._listeners = {};
    return _this;
  }

  var _proto = AnimatedAddition.prototype;

  _proto.__getValue = function __getValue() {
    return this._a.__getValue() + this._b.__getValue();
  };

  _proto.addListener = function addListener(callback) {
    var _this2 = this;

    if (!this._aListener && this._a.addListener) {
      this._aListener = this._a.addListener(function () {
        for (var key in _this2._listeners) {
          _this2._listeners[key]({
            value: _this2.__getValue()
          });
        }
      });
    }

    if (!this._bListener && this._b.addListener) {
      this._bListener = this._b.addListener(function () {
        for (var key in _this2._listeners) {
          _this2._listeners[key]({
            value: _this2.__getValue()
          });
        }
      });
    }

    var id = guid();
    this._listeners[id] = callback;
    return id;
  };

  _proto.removeListener = function removeListener(id) {
    delete this._listeners[id];
  };

  _proto.interpolate = function interpolate(config) {
    return new AnimatedInterpolation_1(this, Interpolation_1.create(config));
  };

  _proto.__attach = function __attach() {
    this._a.__addChild(this);

    this._b.__addChild(this);
  };

  _proto.__detach = function __detach() {
    this._a.__removeChild(this);

    this._b.__removeChild(this);
  };

  return AnimatedAddition;
}(AnimatedWithChildren_1);

var AnimatedAddition_1 = AnimatedAddition;

var _inheritsLoose$6 =
/*#__PURE__*/
require$$0.inheritsLoose;











var AnimatedMultiplication =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$6(AnimatedMultiplication, _AnimatedWithChildren);

  function AnimatedMultiplication(a, b) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._a = typeof a === 'number' ? new AnimatedValue_1(a) : a;
    _this._b = typeof b === 'number' ? new AnimatedValue_1(b) : b;
    _this._listeners = {};
    return _this;
  }

  var _proto = AnimatedMultiplication.prototype;

  _proto.__getValue = function __getValue() {
    return this._a.__getValue() * this._b.__getValue();
  };

  _proto.addListener = function addListener(callback) {
    var _this2 = this;

    if (!this._aListener && this._a.addListener) {
      this._aListener = this._a.addListener(function () {
        for (var key in _this2._listeners) {
          _this2._listeners[key]({
            value: _this2.__getValue()
          });
        }
      });
    }

    if (!this._bListener && this._b.addListener) {
      this._bListener = this._b.addListener(function () {
        for (var key in _this2._listeners) {
          _this2._listeners[key]({
            value: _this2.__getValue()
          });
        }
      });
    }

    var id = guid();
    this._listeners[id] = callback;
    return id;
  };

  _proto.removeListener = function removeListener(id) {
    delete this._listeners[id];
  };

  _proto.interpolate = function interpolate(config) {
    return new AnimatedInterpolation_1(this, Interpolation_1.create(config));
  };

  _proto.__attach = function __attach() {
    this._a.__addChild(this);

    this._b.__addChild(this);
  };

  _proto.__detach = function __detach() {
    this._a.__removeChild(this);

    this._b.__removeChild(this);
  };

  return AnimatedMultiplication;
}(AnimatedWithChildren_1);

var AnimatedMultiplication_1 = AnimatedMultiplication;

var _inheritsLoose$7 =
/*#__PURE__*/
require$$0.inheritsLoose;









var AnimatedModulo =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$7(AnimatedModulo, _AnimatedWithChildren);

  // TODO(lmr): Make modulus able to be an animated value
  function AnimatedModulo(a, modulus) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._a = a;
    _this._modulus = modulus;
    _this._listeners = {};
    return _this;
  }

  var _proto = AnimatedModulo.prototype;

  _proto.__getValue = function __getValue() {
    return (this._a.__getValue() % this._modulus + this._modulus) % this._modulus;
  };

  _proto.addListener = function addListener(callback) {
    var _this2 = this;

    if (!this._aListener) {
      this._aListener = this._a.addListener(function () {
        for (var key in _this2._listeners) {
          _this2._listeners[key]({
            value: _this2.__getValue()
          });
        }
      });
    }

    var id = guid();
    this._listeners[id] = callback;
    return id;
  };

  _proto.removeListener = function removeListener(id) {
    delete this._listeners[id];
  };

  _proto.interpolate = function interpolate(config) {
    return new AnimatedInterpolation_1(this, Interpolation_1.create(config));
  };

  _proto.__attach = function __attach() {
    this._a.__addChild(this);
  };

  _proto.__detach = function __detach() {
    this._a.__removeChild(this);
  };

  return AnimatedModulo;
}(AnimatedWithChildren_1);

var AnimatedModulo_1 = AnimatedModulo;

var _inheritsLoose$8 =
/*#__PURE__*/
require$$0.inheritsLoose;





var AnimatedTemplate =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$8(AnimatedTemplate, _AnimatedWithChildren);

  function AnimatedTemplate(strings, values) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._strings = strings;
    _this._values = values;
    return _this;
  }

  var _proto = AnimatedTemplate.prototype;

  _proto.__transformValue = function __transformValue(value) {
    if (value instanceof Animated_1) {
      return value.__getValue();
    } else {
      return value;
    }
  };

  _proto.__getValue = function __getValue() {
    var value = this._strings[0];

    for (var i = 0; i < this._values.length; ++i) {
      value += this.__transformValue(this._values[i]) + this._strings[1 + i];
    }

    return value;
  };

  _proto.__attach = function __attach() {
    for (var i = 0; i < this._values.length; ++i) {
      if (this._values[i] instanceof Animated_1) {
        this._values[i].__addChild(this);
      }
    }
  };

  _proto.__detach = function __detach() {
    for (var i = 0; i < this._values.length; ++i) {
      if (this._values[i] instanceof Animated_1) {
        this._values[i].__removeChild(this);
      }
    }
  };

  return AnimatedTemplate;
}(AnimatedWithChildren_1);

var AnimatedTemplate_1 = AnimatedTemplate;

var _extends$2 =
/*#__PURE__*/
require$$0.extends;

var _inheritsLoose$9 =
/*#__PURE__*/
require$$0.inheritsLoose;





var AnimatedTracking =
/*#__PURE__*/
function (_Animated) {
  _inheritsLoose$9(AnimatedTracking, _Animated);

  function AnimatedTracking(value, parent, animationClass, animationConfig, callback) {
    var _this;

    _this = _Animated.call(this) || this;
    _this._value = value;
    _this._parent = parent;
    _this._animationClass = animationClass;
    _this._animationConfig = animationConfig;
    _this._callback = callback;

    _this.__attach();

    return _this;
  }

  var _proto = AnimatedTracking.prototype;

  _proto.__getValue = function __getValue() {
    return this._parent.__getValue();
  };

  _proto.__attach = function __attach() {
    this._parent.__addChild(this);
  };

  _proto.__detach = function __detach() {
    this._parent.__removeChild(this);
  };

  _proto.update = function update() {
    this._value.animate(new this._animationClass(_extends$2({}, this._animationConfig, {
      toValue: this._animationConfig.toValue.__getValue()
    })), this._callback);
  };

  return AnimatedTracking;
}(Animated_1);

var AnimatedTracking_1 = AnimatedTracking;

function isAnimated(obj) {
  return obj instanceof Animated_1;
}

var isAnimated_1 = isAnimated;

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 * @nolint
 */
// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
var float32ArraySupported = typeof Float32Array === 'function';

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}

function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1;
}

function C(aA1) {
  return 3.0 * aA1;
} // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.


function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
} // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.


function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  var currentX,
      currentT,
      i = 0;

  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;

    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

  return currentT;
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);

    if (currentSlope === 0.0) {
      return aGuessT;
    }

    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }

  return aGuessT;
}

var bezier = function bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    // eslint-disable-line yoda
    throw new Error('bezier x values must be in [0, 1] range');
  } // Precompute samples table


  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX(aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }

    --currentSample; // Interpolate to provide an initial guess for t

    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;
    var initialSlope = getSlope(guessForT, mX1, mX2);

    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing(x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    } // Because JavaScript number are imprecise, we should guarantee the extremes are right.


    if (x === 0) {
      return 0;
    }

    if (x === 1) {
      return 1;
    }

    return calcBezier(getTForX(x), mY1, mY2);
  };
};

/**
 * This class implements common easing functions. The math is pretty obscure,
 * but this cool website has nice visual illustrations of what they represent:
 * http://xaedes.de/dev/transitions/
 */


var Easing =
/*#__PURE__*/
function () {
  function Easing() {}

  Easing.step0 = function step0(n) {
    return n > 0 ? 1 : 0;
  };

  Easing.step1 = function step1(n) {
    return n >= 1 ? 1 : 0;
  };

  Easing.linear = function linear(t) {
    return t;
  };

  Easing.ease = function ease(t) {
    return _ease(t);
  };

  Easing.quad = function quad(t) {
    return t * t;
  };

  Easing.cubic = function cubic(t) {
    return t * t * t;
  };

  Easing.poly = function poly(n) {
    return function (t) {
      return Math.pow(t, n);
    };
  };

  Easing.sin = function sin(t) {
    return 1 - Math.cos(t * Math.PI / 2);
  };

  Easing.circle = function circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  };

  Easing.exp = function exp(t) {
    return Math.pow(2, 10 * (t - 1));
  };
  /**
   * A simple elastic interaction, similar to a spring.  Default bounciness
   * is 1, which overshoots a little bit once.  0 bounciness doesn't overshoot
   * at all, and bounciness of N > 1 will overshoot about N times.
   *
   * Wolfram Plots:
   *
   *   http://tiny.cc/elastic_b_1 (default bounciness = 1)
   *   http://tiny.cc/elastic_b_3 (bounciness = 3)
   */


  Easing.elastic = function elastic(bounciness) {
    if (bounciness === void 0) {
      bounciness = 1;
    }

    var p = bounciness * Math.PI;
    return function (t) {
      return 1 - Math.pow(Math.cos(t * Math.PI / 2), 3) * Math.cos(t * p);
    };
  };

  Easing.back = function back(s) {
    if (s === undefined) {
      s = 1.70158;
    }

    return function (t) {
      return t * t * ((s + 1) * t - s);
    };
  };

  Easing.bounce = function bounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    }

    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    }

    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }

    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  };

  Easing.bezier = function bezier$$1(x1, y1, x2, y2) {
    return bezier(x1, y1, x2, y2);
  };

  Easing.in = function _in(easing) {
    return easing;
  };
  /**
   * Runs an easing function backwards.
   */


  Easing.out = function out(easing) {
    return function (t) {
      return 1 - easing(1 - t);
    };
  };
  /**
   * Makes any easing function symmetrical.
   */


  Easing.inOut = function inOut(easing) {
    return function (t) {
      if (t < 0.5) {
        return easing(t * 2) / 2;
      }

      return 1 - easing((1 - t) * 2) / 2;
    };
  };

  return Easing;
}();

var _ease =
/*#__PURE__*/
Easing.bezier(0.42, 0, 1, 1);

var Easing_1 = Easing;

var RequestAnimationFrame = {
  current: function current(cb) {
    return commonjsGlobal.requestAnimationFrame(cb);
  },
  inject: function inject(injected) {
    RequestAnimationFrame.current = injected;
  }
};
var RequestAnimationFrame_1 = RequestAnimationFrame;

var CancelAnimationFrame = {
  current: function current(id) {
    return commonjsGlobal.cancelAnimationFrame(id);
  },
  inject: function inject(injected) {
    CancelAnimationFrame.current = injected;
  }
};
var CancelAnimationFrame_1 = CancelAnimationFrame;

var _inheritsLoose$10 =
/*#__PURE__*/
require$$0.inheritsLoose;











var easeInOut =
/*#__PURE__*/
Easing_1.inOut(Easing_1.ease);

var TimingAnimation =
/*#__PURE__*/
function (_Animation) {
  _inheritsLoose$10(TimingAnimation, _Animation);

  function TimingAnimation(config) {
    var _this;

    _this = _Animation.call(this) || this;
    _this._toValue = config.toValue;
    _this._easing = config.easing !== undefined ? config.easing : easeInOut;
    _this._duration = config.duration !== undefined ? config.duration : 500;
    _this._delay = config.delay !== undefined ? config.delay : 0;
    _this.__isInteraction = config.isInteraction !== undefined ? config.isInteraction : true;
    return _this;
  }

  var _proto = TimingAnimation.prototype;

  _proto.start = function start(fromValue, onUpdate, onEnd) {
    var _this2 = this;

    this.__active = true;
    this._fromValue = fromValue;
    this._onUpdate = onUpdate;
    this.__onEnd = onEnd;

    var start = function start() {
      if (_this2._duration === 0) {
        _this2._onUpdate(_this2._toValue);

        _this2.__debouncedOnEnd({
          finished: true
        });
      } else {
        _this2._startTime = Date.now();
        _this2._animationFrame = RequestAnimationFrame_1.current(_this2.onUpdate.bind(_this2));
      }
    };

    if (this._delay) {
      this._timeout = setTimeout(start, this._delay);
    } else {
      start();
    }
  };

  _proto.onUpdate = function onUpdate() {
    var now = Date.now();

    if (now >= this._startTime + this._duration) {
      if (this._duration === 0) {
        this._onUpdate(this._toValue);
      } else {
        this._onUpdate(this._fromValue + this._easing(1) * (this._toValue - this._fromValue));
      }

      this.__debouncedOnEnd({
        finished: true
      });

      return;
    }

    this._onUpdate(this._fromValue + this._easing((now - this._startTime) / this._duration) * (this._toValue - this._fromValue));

    if (this.__active) {
      this._animationFrame = RequestAnimationFrame_1.current(this.onUpdate.bind(this));
    }
  };

  _proto.stop = function stop() {
    this.__active = false;
    clearTimeout(this._timeout);
    CancelAnimationFrame_1.current(this._animationFrame);

    this.__debouncedOnEnd({
      finished: false
    });
  };

  return TimingAnimation;
}(Animation_1);

var TimingAnimation_1 = TimingAnimation;

var _inheritsLoose$11 =
/*#__PURE__*/
require$$0.inheritsLoose;







var DecayAnimation =
/*#__PURE__*/
function (_Animation) {
  _inheritsLoose$11(DecayAnimation, _Animation);

  function DecayAnimation(config) {
    var _this;

    _this = _Animation.call(this) || this;
    _this._deceleration = config.deceleration !== undefined ? config.deceleration : 0.998;
    _this._velocity = config.velocity;
    _this.__isInteraction = config.isInteraction !== undefined ? config.isInteraction : true;
    return _this;
  }

  var _proto = DecayAnimation.prototype;

  _proto.start = function start(fromValue, onUpdate, onEnd) {
    this.__active = true;
    this._lastValue = fromValue;
    this._fromValue = fromValue;
    this._onUpdate = onUpdate;
    this.__onEnd = onEnd;
    this._startTime = Date.now();
    this._animationFrame = RequestAnimationFrame_1.current(this.onUpdate.bind(this));
  };

  _proto.onUpdate = function onUpdate() {
    var now = Date.now();
    var value = this._fromValue + this._velocity / (1 - this._deceleration) * (1 - Math.exp(-(1 - this._deceleration) * (now - this._startTime)));

    this._onUpdate(value);

    if (Math.abs(this._lastValue - value) < 0.1) {
      this.__debouncedOnEnd({
        finished: true
      });

      return;
    }

    this._lastValue = value;

    if (this.__active) {
      this._animationFrame = RequestAnimationFrame_1.current(this.onUpdate.bind(this));
    }
  };

  _proto.stop = function stop() {
    this.__active = false;
    CancelAnimationFrame_1.current(this._animationFrame);

    this.__debouncedOnEnd({
      finished: false
    });
  };

  return DecayAnimation;
}(Animation_1);

var DecayAnimation_1 = DecayAnimation;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function tensionFromOrigamiValue(oValue) {
  return (oValue - 30) * 3.62 + 194;
}

function frictionFromOrigamiValue(oValue) {
  return (oValue - 8) * 3 + 25;
}

function fromOrigamiTensionAndFriction(tension, friction) {
  return {
    tension: tensionFromOrigamiValue(tension),
    friction: frictionFromOrigamiValue(friction)
  };
}

function fromBouncinessAndSpeed(bounciness, speed) {
  function normalize(value, startValue, endValue) {
    return (value - startValue) / (endValue - startValue);
  }

  function projectNormal(n, start, end) {
    return start + n * (end - start);
  }

  function linearInterpolation(t, start, end) {
    return t * end + (1 - t) * start;
  }

  function quadraticOutInterpolation(t, start, end) {
    return linearInterpolation(2 * t - t * t, start, end);
  }

  function b3Friction1(x) {
    return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
  }

  function b3Friction2(x) {
    return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2;
  }

  function b3Friction3(x) {
    return 0.00000045 * Math.pow(x, 3) - 0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;
  }

  function b3Nobounce(tension) {
    if (tension <= 18) {
      return b3Friction1(tension);
    } else if (tension > 18 && tension <= 44) {
      return b3Friction2(tension);
    } else {
      return b3Friction3(tension);
    }
  }

  var b = normalize(bounciness / 1.7, 0, 20);
  b = projectNormal(b, 0, 0.8);
  var s = normalize(speed / 1.7, 0, 20);
  var bouncyTension = projectNormal(s, 0.5, 200);
  var bouncyFriction = quadraticOutInterpolation(b, b3Nobounce(bouncyTension), 0.01);
  return {
    tension: tensionFromOrigamiValue(bouncyTension),
    friction: frictionFromOrigamiValue(bouncyFriction)
  };
}

var SpringConfig = {
  fromOrigamiTensionAndFriction: fromOrigamiTensionAndFriction,
  fromBouncinessAndSpeed: fromBouncinessAndSpeed
};

var _inheritsLoose$12 =
/*#__PURE__*/
require$$0.inheritsLoose;













function withDefault(value, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  return value;
}

var SpringAnimation =
/*#__PURE__*/
function (_Animation) {
  _inheritsLoose$12(SpringAnimation, _Animation);

  function SpringAnimation(config) {
    var _this;

    _this = _Animation.call(this) || this;
    _this._overshootClamping = withDefault(config.overshootClamping, false);
    _this._restDisplacementThreshold = withDefault(config.restDisplacementThreshold, 0.001);
    _this._restSpeedThreshold = withDefault(config.restSpeedThreshold, 0.001);
    _this._initialVelocity = config.velocity;
    _this._lastVelocity = withDefault(config.velocity, 0);
    _this._toValue = config.toValue;
    _this.__isInteraction = config.isInteraction !== undefined ? config.isInteraction : true;
    var springConfig;

    if (config.bounciness !== undefined || config.speed !== undefined) {
      invariant_1(config.tension === undefined && config.friction === undefined, 'You can only define bounciness/speed or tension/friction but not both');
      springConfig = SpringConfig.fromBouncinessAndSpeed(withDefault(config.bounciness, 8), withDefault(config.speed, 12));
    } else {
      springConfig = SpringConfig.fromOrigamiTensionAndFriction(withDefault(config.tension, 40), withDefault(config.friction, 7));
    }

    _this._tension = springConfig.tension;
    _this._friction = springConfig.friction;
    return _this;
  }

  var _proto = SpringAnimation.prototype;

  _proto.start = function start(fromValue, onUpdate, onEnd, previousAnimation) {
    this.__active = true;
    this._startPosition = fromValue;
    this._lastPosition = this._startPosition;
    this._onUpdate = onUpdate;
    this.__onEnd = onEnd;
    this._lastTime = Date.now();

    if (previousAnimation instanceof SpringAnimation) {
      var internalState = previousAnimation.getInternalState();
      this._lastPosition = internalState.lastPosition;
      this._lastVelocity = internalState.lastVelocity;
      this._lastTime = internalState.lastTime;
    }

    if (this._initialVelocity !== undefined && this._initialVelocity !== null) {
      this._lastVelocity = this._initialVelocity;
    }

    this.onUpdate();
  };

  _proto.getInternalState = function getInternalState() {
    return {
      lastPosition: this._lastPosition,
      lastVelocity: this._lastVelocity,
      lastTime: this._lastTime
    };
  };

  _proto.onUpdate = function onUpdate() {
    var position = this._lastPosition;
    var velocity = this._lastVelocity;
    var tempPosition = this._lastPosition;
    var tempVelocity = this._lastVelocity; // If for some reason we lost a lot of frames (e.g. process large payload or
    // stopped in the debugger), we only advance by 4 frames worth of
    // computation and will continue on the next frame. It's better to have it
    // running at faster speed than jumping to the end.

    var MAX_STEPS = 64;
    var now = Date.now();

    if (now > this._lastTime + MAX_STEPS) {
      now = this._lastTime + MAX_STEPS;
    } // We are using a fixed time step and a maximum number of iterations.
    // The following post provides a lot of thoughts into how to build this
    // loop: http://gafferongames.com/game-physics/fix-your-timestep/


    var TIMESTEP_MSEC = 1;
    var numSteps = Math.floor((now - this._lastTime) / TIMESTEP_MSEC);

    for (var i = 0; i < numSteps; ++i) {
      // Velocity is based on seconds instead of milliseconds
      var step = TIMESTEP_MSEC / 1000; // This is using RK4. A good blog post to understand how it works:
      // http://gafferongames.com/game-physics/integration-basics/

      var aVelocity = velocity;
      var aAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
      var tempPosition = position + aVelocity * step / 2;
      var tempVelocity = velocity + aAcceleration * step / 2;
      var bVelocity = tempVelocity;
      var bAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
      tempPosition = position + bVelocity * step / 2;
      tempVelocity = velocity + bAcceleration * step / 2;
      var cVelocity = tempVelocity;
      var cAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
      tempPosition = position + cVelocity * step / 2;
      tempVelocity = velocity + cAcceleration * step / 2;
      var dVelocity = tempVelocity;
      var dAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
      tempPosition = position + cVelocity * step / 2;
      tempVelocity = velocity + cAcceleration * step / 2;
      var dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6;
      var dvdt = (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) / 6;
      position += dxdt * step;
      velocity += dvdt * step;
    }

    this._lastTime = now;
    this._lastPosition = position;
    this._lastVelocity = velocity;

    this._onUpdate(position);

    if (!this.__active) {
      // a listener might have stopped us in _onUpdate
      return;
    } // Conditions for stopping the spring animation


    var isOvershooting = false;

    if (this._overshootClamping && this._tension !== 0) {
      if (this._startPosition < this._toValue) {
        isOvershooting = position > this._toValue;
      } else {
        isOvershooting = position < this._toValue;
      }
    }

    var isVelocity = Math.abs(velocity) <= this._restSpeedThreshold;

    var isDisplacement = true;

    if (this._tension !== 0) {
      isDisplacement = Math.abs(this._toValue - position) <= this._restDisplacementThreshold;
    }

    if (isOvershooting || isVelocity && isDisplacement) {
      if (this._tension !== 0) {
        // Ensure that we end up with a round value
        this._onUpdate(this._toValue);
      }

      this.__debouncedOnEnd({
        finished: true
      });

      return;
    }

    this._animationFrame = RequestAnimationFrame_1.current(this.onUpdate.bind(this));
  };

  _proto.stop = function stop() {
    this.__active = false;
    CancelAnimationFrame_1.current(this._animationFrame);

    this.__debouncedOnEnd({
      finished: false
    });
  };

  return SpringAnimation;
}(Animation_1);

var SpringAnimation_1 = SpringAnimation;

var _inheritsLoose$13 =
/*#__PURE__*/
require$$0.inheritsLoose;





var AnimatedTransform =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$13(AnimatedTransform, _AnimatedWithChildren);

  function AnimatedTransform(transforms) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    _this._transforms = transforms;
    return _this;
  }

  var _proto = AnimatedTransform.prototype;

  _proto.__getValue = function __getValue() {
    return this._transforms.map(function (transform) {
      var result = {};

      for (var key in transform) {
        var value = transform[key];

        if (value instanceof Animated_1) {
          result[key] = value.__getValue();
        } else {
          result[key] = value;
        }
      }

      return result;
    });
  };

  _proto.__getAnimatedValue = function __getAnimatedValue() {
    return this._transforms.map(function (transform) {
      var result = {};

      for (var key in transform) {
        var value = transform[key];

        if (value instanceof Animated_1) {
          result[key] = value.__getAnimatedValue();
        } else {
          // All transform components needed to recompose matrix
          result[key] = value;
        }
      }

      return result;
    });
  };

  _proto.__attach = function __attach() {
    var _this2 = this;

    this._transforms.forEach(function (transform) {
      for (var key in transform) {
        var value = transform[key];

        if (value instanceof Animated_1) {
          value.__addChild(_this2);
        }
      }
    });
  };

  _proto.__detach = function __detach() {
    var _this3 = this;

    this._transforms.forEach(function (transform) {
      for (var key in transform) {
        var value = transform[key];

        if (value instanceof Animated_1) {
          value.__removeChild(_this3);
        }
      }
    });
  };

  return AnimatedTransform;
}(AnimatedWithChildren_1);

var AnimatedTransform_1 = AnimatedTransform;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var FlattenStyle = {
  current: function current(style) {
    return style;
  },
  inject: function inject(flatten) {
    FlattenStyle.current = flatten;
  }
};
var FlattenStyle_1 = FlattenStyle;

var _extends$3 =
/*#__PURE__*/
require$$0.extends;

var _inheritsLoose$14 =
/*#__PURE__*/
require$$0.inheritsLoose;









var AnimatedStyle =
/*#__PURE__*/
function (_AnimatedWithChildren) {
  _inheritsLoose$14(AnimatedStyle, _AnimatedWithChildren);

  function AnimatedStyle(style) {
    var _this;

    _this = _AnimatedWithChildren.call(this) || this;
    style = FlattenStyle_1.current(style) || {};

    if (style.transform && !(style.transform instanceof Animated_1)) {
      style = _extends$3({}, style, {
        transform: new AnimatedTransform_1(style.transform)
      });
    }

    _this._style = style;
    return _this;
  }

  var _proto = AnimatedStyle.prototype;

  _proto.__getValue = function __getValue() {
    var style = {};

    for (var key in this._style) {
      var value = this._style[key];

      if (value instanceof Animated_1) {
        style[key] = value.__getValue();
      } else {
        style[key] = value;
      }
    }

    return style;
  };

  _proto.__getAnimatedValue = function __getAnimatedValue() {
    var style = {};

    for (var key in this._style) {
      var value = this._style[key];

      if (value instanceof Animated_1) {
        style[key] = value.__getAnimatedValue();
      }
    }

    return style;
  };

  _proto.__attach = function __attach() {
    for (var key in this._style) {
      var value = this._style[key];

      if (value instanceof Animated_1) {
        value.__addChild(this);
      }
    }
  };

  _proto.__detach = function __detach() {
    for (var key in this._style) {
      var value = this._style[key];

      if (value instanceof Animated_1) {
        value.__removeChild(this);
      }
    }
  };

  return AnimatedStyle;
}(AnimatedWithChildren_1);

var AnimatedStyle_1 = AnimatedStyle;

var _extends$4 =
/*#__PURE__*/
require$$0.extends;

var _inheritsLoose$15 =
/*#__PURE__*/
require$$0.inheritsLoose;





var AnimatedProps =
/*#__PURE__*/
function (_Animated) {
  _inheritsLoose$15(AnimatedProps, _Animated);

  function AnimatedProps(props, callback) {
    var _this;

    _this = _Animated.call(this) || this;

    if (props.style) {
      props = _extends$4({}, props, {
        style: new AnimatedStyle_1(props.style)
      });
    }

    _this._props = props;
    _this._callback = callback;

    _this.__attach();

    return _this;
  }

  var _proto = AnimatedProps.prototype;

  _proto.__getValue = function __getValue() {
    var props = {};

    for (var key in this._props) {
      var value = this._props[key];

      if (value instanceof Animated_1) {
        props[key] = value.__getValue();
      } else {
        props[key] = value;
      }
    }

    return props;
  };

  _proto.__getAnimatedValue = function __getAnimatedValue() {
    var props = {};

    for (var key in this._props) {
      var value = this._props[key];

      if (value instanceof Animated_1) {
        props[key] = value.__getAnimatedValue();
      }
    }

    return props;
  };

  _proto.__attach = function __attach() {
    for (var key in this._props) {
      var value = this._props[key];

      if (value instanceof Animated_1) {
        value.__addChild(this);
      }
    }
  };

  _proto.__detach = function __detach() {
    for (var key in this._props) {
      var value = this._props[key];

      if (value instanceof Animated_1) {
        value.__removeChild(this);
      }
    }
  };

  _proto.update = function update() {
    this._callback();
  };

  return AnimatedProps;
}(Animated_1);

var AnimatedProps_1 = AnimatedProps;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

var ApplyAnimatedValues = {
  current: function ApplyAnimatedValues(instance, props) {
    if (instance.setNativeProps) {
      instance.setNativeProps(props);
    } else {
      return false;
    }
  },
  transformStyles: function transformStyles(style) {
    return style;
  },
  inject: function inject(apply, transform) {
    ApplyAnimatedValues.current = apply;
    ApplyAnimatedValues.transformStyles = transform;
  }
};
var ApplyAnimatedValues_1 = ApplyAnimatedValues;

var _extends$5 =
/*#__PURE__*/
require$$0.extends;

var _objectWithoutProperties$1 =
/*#__PURE__*/
require$$0.objectWithoutProperties;

var _inheritsLoose$16 =
/*#__PURE__*/
require$$0.inheritsLoose;







function createAnimatedComponent(Component) {
  var AnimatedComponent =
  /*#__PURE__*/
  function (_React$Component) {
    _inheritsLoose$16(AnimatedComponent, _React$Component);

    function AnimatedComponent() {
      return _React$Component.apply(this, arguments) || this;
    }

    var _proto = AnimatedComponent.prototype;

    _proto.componentWillUnmount = function componentWillUnmount() {
      this._propsAnimated && this._propsAnimated.__detach();
    };

    _proto.setNativeProps = function setNativeProps(props) {
      var didUpdate = this.refName && ApplyAnimatedValues_1.current(this.refName, props, this);

      if (!didUpdate) {
        this.forceUpdate();
      }
    };

    _proto.componentWillMount = function componentWillMount() {
      this.attachProps(this.props);
    };

    _proto.attachProps = function attachProps(nextProps) {
      var _this = this;

      var oldPropsAnimated = this._propsAnimated; // The system is best designed when setNativeProps is implemented. It is
      // able to avoid re-rendering and directly set the attributes that
      // changed. However, setNativeProps can only be implemented on leaf
      // native components. If you want to animate a composite component, you
      // need to re-render it. In this case, we have a fallback that uses
      // forceUpdate.

      var callback = function callback() {
        var didUpdate = _this.refName && ApplyAnimatedValues_1.current(_this.refName, _this._propsAnimated.__getAnimatedValue(), _this);

        if (!didUpdate) {
          _this.forceUpdate();
        }
      };

      this._propsAnimated = new AnimatedProps_1(nextProps, callback); // When you call detach, it removes the element from the parent list
      // of children. If it goes to 0, then the parent also detaches itself
      // and so on.
      // An optimization is to attach the new elements and THEN detach the old
      // ones instead of detaching and THEN attaching.
      // This way the intermediate state isn't to go to 0 and trigger
      // this expensive recursive detaching to then re-attach everything on
      // the very next operation.

      oldPropsAnimated && oldPropsAnimated.__detach();
    };

    _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      this.attachProps(nextProps);
    };

    _proto.render = function render() {
      var _this2 = this;

      var _propsAnimated$__getV = this._propsAnimated.__getValue(),
          style = _propsAnimated$__getV.style,
          other = _objectWithoutProperties$1(_propsAnimated$__getV, ["style"]);

      return react.createElement(Component, _extends$5({}, other, {
        style: ApplyAnimatedValues_1.transformStyles(style),
        ref: function ref(_ref) {
          return _this2.refName = _ref;
        }
      }));
    };

    return AnimatedComponent;
  }(react.Component);

  process.env.NODE_ENV !== "production" ? AnimatedComponent.propTypes = {
    style: function style(props, propName, componentName) {
      if (!Component.propTypes) {
        return;
      } // TODO(lmr): We will probably bring this back in at some point, but maybe
      // just a subset of the proptypes... We should have a common set of props
      // that will be used for all platforms.
      //
      // for (var key in ViewStylePropTypes) {
      //   if (!Component.propTypes[key] && props[key] !== undefined) {
      //     console.error(
      //       'You are setting the style `{ ' + key + ': ... }` as a prop. You ' +
      //       'should nest it in a style object. ' +
      //       'E.g. `{ style: { ' + key + ': ... } }`'
      //     );
      //   }
      // }

    }
  } : void 0;
  return AnimatedComponent;
}

var createAnimatedComponent_1 = createAnimatedComponent;

var _extends$6 =
/*#__PURE__*/
require$$0.extends;





























var maybeVectorAnim = function maybeVectorAnim(value, config, anim) {
  if (value instanceof AnimatedValueXY_1) {
    var configX = _extends$6({}, config);

    var configY = _extends$6({}, config);

    for (var key in config) {
      var _config$key = config[key],
          x = _config$key.x,
          y = _config$key.y;

      if (x !== undefined && y !== undefined) {
        configX[key] = x;
        configY[key] = y;
      }
    }

    var aX = anim(value.x, configX);
    var aY = anim(value.y, configY); // We use `stopTogether: false` here because otherwise tracking will break
    // because the second animation will get stopped before it can update.

    return parallel([aX, aY], {
      stopTogether: false
    });
  }

  return null;
};

var spring = function spring(value, config) {
  return maybeVectorAnim(value, config, spring) || {
    start: function start(callback) {
      var singleValue = value;
      var singleConfig = config;
      singleValue.stopTracking();

      if (config.toValue instanceof Animated_1) {
        singleValue.track(new AnimatedTracking_1(singleValue, config.toValue, SpringAnimation_1, singleConfig, callback));
      } else {
        singleValue.animate(new SpringAnimation_1(singleConfig), callback);
      }
    },
    stop: function stop() {
      value.stopAnimation();
    }
  };
};

var timing = function timing(value, config) {
  return maybeVectorAnim(value, config, timing) || {
    start: function start(callback) {
      var singleValue = value;
      var singleConfig = config;
      singleValue.stopTracking();

      if (config.toValue instanceof Animated_1) {
        singleValue.track(new AnimatedTracking_1(singleValue, config.toValue, TimingAnimation_1, singleConfig, callback));
      } else {
        singleValue.animate(new TimingAnimation_1(singleConfig), callback);
      }
    },
    stop: function stop() {
      value.stopAnimation();
    }
  };
};

var decay = function decay(value, config) {
  return maybeVectorAnim(value, config, decay) || {
    start: function start(callback) {
      var singleValue = value;
      var singleConfig = config;
      singleValue.stopTracking();
      singleValue.animate(new DecayAnimation_1(singleConfig), callback);
    },
    stop: function stop() {
      value.stopAnimation();
    }
  };
};

var sequence = function sequence(animations) {
  var current = 0;
  return {
    start: function start(callback) {
      var onComplete = function onComplete(result) {
        if (!result.finished) {
          callback && callback(result);
          return;
        }

        current++;

        if (current === animations.length) {
          callback && callback(result);
          return;
        }

        animations[current].start(onComplete);
      };

      if (animations.length === 0) {
        callback && callback({
          finished: true
        });
      } else {
        animations[current].start(onComplete);
      }
    },
    stop: function stop() {
      if (current < animations.length) {
        animations[current].stop();
      }
    }
  };
};

var parallel = function parallel(animations, config) {
  var doneCount = 0; // Make sure we only call stop() at most once for each animation

  var hasEnded = {};
  var stopTogether = !(config && config.stopTogether === false);
  var result = {
    start: function start(callback) {
      if (doneCount === animations.length) {
        callback && callback({
          finished: true
        });
        return;
      }

      animations.forEach(function (animation, idx) {
        var cb = function cb(endResult) {
          hasEnded[idx] = true;
          doneCount++;

          if (doneCount === animations.length) {
            doneCount = 0;
            callback && callback(endResult);
            return;
          }

          if (!endResult.finished && stopTogether) {
            result.stop();
          }
        };

        if (!animation) {
          cb({
            finished: true
          });
        } else {
          animation.start(cb);
        }
      });
    },
    stop: function stop() {
      animations.forEach(function (animation, idx) {
        !hasEnded[idx] && animation.stop();
        hasEnded[idx] = true;
      });
    }
  };
  return result;
};

var delay = function delay(time) {
  // Would be nice to make a specialized implementation
  return timing(new AnimatedValue_1(0), {
    toValue: 0,
    delay: time,
    duration: 0
  });
};

var stagger = function stagger(time, animations) {
  return parallel(animations.map(function (animation, i) {
    return sequence([delay(time * i), animation]);
  }));
};

var event = function event(argMapping, config) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var traverse = function traverse(recMapping, recEvt, key) {
      if (typeof recEvt === 'number') {
        invariant_1(recMapping instanceof AnimatedValue_1, 'Bad mapping of type ' + typeof recMapping + ' for key ' + key + ', event value must map to AnimatedValue');
        recMapping.setValue(recEvt);
        return;
      }

      invariant_1(typeof recMapping === 'object', 'Bad mapping of type ' + typeof recMapping + ' for key ' + key);
      invariant_1(typeof recEvt === 'object', 'Bad event of type ' + typeof recEvt + ' for key ' + key);

      for (var key in recMapping) {
        traverse(recMapping[key], recEvt[key], key);
      }
    };

    argMapping.forEach(function (mapping, idx) {
      traverse(mapping, args[idx], 'arg' + idx);
    });

    if (config && config.listener) {
      config.listener.apply(null, args);
    }
  };
};
/**
 * Animations are an important part of modern UX, and the `Animated`
 * library is designed to make them fluid, powerful, and easy to build and
 * maintain.
 *
 * The simplest workflow is to create an `Animated.Value`, hook it up to one or
 * more style attributes of an animated component, and then drive updates either
 * via animations, such as `Animated.timing`, or by hooking into gestures like
 * panning or scrolling via `Animated.event`.  `Animated.Value` can also bind to
 * props other than style, and can be interpolated as well.  Here is a basic
 * example of a container view that will fade in when it's mounted:
 *
 *```javascript
 *  class FadeInView extends React.Component {
 *    constructor(props) {
 *      super(props);
 *      this.state = {
 *        fadeAnim: new Animated.Value(0), // init opacity 0
 *      };
 *    }
 *    componentDidMount() {
 *      Animated.timing(          // Uses easing functions
 *        this.state.fadeAnim,    // The value to drive
 *        {toValue: 1},           // Configuration
 *      ).start();                // Don't forget start!
 *    }
 *    render() {
 *      return (
 *        <Animated.View          // Special animatable View
 *          style={{opacity: this.state.fadeAnim}}> // Binds
 *          {this.props.children}
 *        </Animated.View>
 *      );
 *    }
 *  }
 *```
 *
 * Note that only animatable components can be animated.  `View`, `Text`, and
 * `Image` are already provided, and you can create custom ones with
 * `createAnimatedComponent`.  These special components do the magic of binding
 * the animated values to the properties, and do targeted native updates to
 * avoid the cost of the react render and reconciliation process on every frame.
 * They also handle cleanup on unmount so they are safe by default.
 *
 * Animations are heavily configurable.  Custom and pre-defined easing
 * functions, delays, durations, decay factors, spring constants, and more can
 * all be tweaked depending on the type of animation.
 *
 * A single `Animated.Value` can drive any number of properties, and each
 * property can be run through an interpolation first.  An interpolation maps
 * input ranges to output ranges, typically using a linear interpolation but
 * also supports easing functions.  By default, it will extrapolate the curve
 * beyond the ranges given, but you can also have it clamp the output value.
 *
 * For example, you may want to think about your `Animated.Value` as going from
 * 0 to 1, but animate the position from 150px to 0px and the opacity from 0 to
 * 1. This can easily be done by modifying `style` in the example above like so:
 *
 *```javascript
 *  style={{
 *    opacity: this.state.fadeAnim, // Binds directly
 *    transform: [{
 *      translateY: this.state.fadeAnim.interpolate({
 *        inputRange: [0, 1],
 *        outputRange: [150, 0]  // 0 : 150, 0.5 : 75, 1 : 0
 *      }),
 *    }],
 *  }}>
 *```
 *
 * Animations can also be combined in complex ways using composition functions
 * such as `sequence` and `parallel`, and can also be chained together simply
 * by setting the `toValue` of one animation to be another `Animated.Value`.
 *
 * `Animated.ValueXY` is handy for 2D animations, like panning, and there are
 * other helpful additions like `setOffset` and `getLayout` to aid with typical
 * interaction patterns, like drag-and-drop.
 *
 * You can see more example usage in `AnimationExample.js`, the Gratuitous
 * Animation App, and [Animations documentation guide](docs/animations.html).
 *
 * Note that `Animated` is designed to be fully serializable so that animations
 * can be run in a high performance way, independent of the normal JavaScript
 * event loop. This does influence the API, so keep that in mind when it seems a
 * little trickier to do something compared to a fully synchronous system.
 * Checkout `Animated.Value.addListener` as a way to work around some of these
 * limitations, but use it sparingly since it might have performance
 * implications in the future.
 */


var src = {
  /**
   * Standard value class for driving animations.  Typically initialized with
   * `new Animated.Value(0);`
   */
  Value: AnimatedValue_1,

  /**
   * 2D value class for driving 2D animations, such as pan gestures.
   */
  ValueXY: AnimatedValueXY_1,

  /**
   * Animates a value from an initial velocity to zero based on a decay
   * coefficient.
   */
  decay: decay,

  /**
   * Animates a value along a timed easing curve.  The `Easing` module has tons
   * of pre-defined curves, or you can use your own function.
   */
  timing: timing,

  /**
   * Spring animation based on Rebound and Origami.  Tracks velocity state to
   * create fluid motions as the `toValue` updates, and can be chained together.
   */
  spring: spring,

  /**
   * Creates a new Animated value composed from two Animated values added
   * together.
   */
  add: function add(a, b) {
    return new AnimatedAddition_1(a, b);
  },

  /**
   * Creates a new Animated value composed from two Animated values multiplied
   * together.
   */
  multiply: function multiply(a, b) {
    return new AnimatedMultiplication_1(a, b);
  },

  /**
   * Creates a new Animated value that is the (non-negative) modulo of the
   * provided Animated value
   */
  modulo: function modulo(a, modulus) {
    return new AnimatedModulo_1(a, modulus);
  },

  /**
   * Creates a new Animated value that is the specified string, with each
   * substitution expression being separately animated and interpolated.
   */
  template: function template(strings) {
    for (var _len2 = arguments.length, values = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      values[_key2 - 1] = arguments[_key2];
    }

    return new AnimatedTemplate_1(strings, values);
  },

  /**
   * Starts an animation after the given delay.
   */
  delay: delay,

  /**
   * Starts an array of animations in order, waiting for each to complete
   * before starting the next.  If the current running animation is stopped, no
   * following animations will be started.
   */
  sequence: sequence,

  /**
   * Starts an array of animations all at the same time.  By default, if one
   * of the animations is stopped, they will all be stopped.  You can override
   * this with the `stopTogether` flag.
   */
  parallel: parallel,

  /**
   * Array of animations may run in parallel (overlap), but are started in
   * sequence with successive delays.  Nice for doing trailing effects.
   */
  stagger: stagger,

  /**
   *  Takes an array of mappings and extracts values from each arg accordingly,
   *  then calls `setValue` on the mapped outputs.  e.g.
   *
   *```javascript
   *  onScroll={Animated.event(
   *    [{nativeEvent: {contentOffset: {x: this._scrollX}}}]
   *    {listener},          // Optional async listener
   *  )
   *  ...
   *  onPanResponderMove: Animated.event([
   *    null,                // raw event arg ignored
   *    {dx: this._panX},    // gestureState arg
   *  ]),
   *```
   */
  event: event,

  /**
   * Existential test to figure out if an object is an instance of the Animated
   * class or not.
   */
  isAnimated: isAnimated_1,

  /**
   * Make any React component Animatable.  Used to create `Animated.View`, etc.
   */
  createAnimatedComponent:
  /*#__PURE__*/
  createAnimatedComponent_1,
  inject: {
    ApplyAnimatedValues:
    /*#__PURE__*/
    ApplyAnimatedValues_1.inject,
    InteractionManager:
    /*#__PURE__*/
    InteractionManager_1.inject,
    FlattenStyle:
    /*#__PURE__*/
    FlattenStyle_1.inject,
    RequestAnimationFrame:
    /*#__PURE__*/
    RequestAnimationFrame_1.inject,
    CancelAnimationFrame:
    /*#__PURE__*/
    CancelAnimationFrame_1.inject
  },
  __PropsOnlyForTests:
  /*#__PURE__*/
  AnimatedProps_1
};
var src_1 = src.Value;
var src_2 = src.ValueXY;
var src_3 = src.decay;
var src_4 = src.timing;
var src_5 = src.spring;
var src_6 = src.add;
var src_7 = src.multiply;
var src_8 = src.modulo;
var src_9 = src.template;
var src_10 = src.delay;
var src_11 = src.sequence;
var src_12 = src.parallel;
var src_13 = src.stagger;
var src_14 = src.event;
var src_15 = src.isAnimated;
var src_16 = src.createAnimatedComponent;
var src_17 = src.inject;
var src_18 = src.__PropsOnlyForTests;

export default src;
export { src_1 as Value, src_2 as ValueXY, src_3 as decay, src_4 as timing, src_5 as spring, src_6 as add, src_7 as multiply, src_8 as modulo, src_9 as template, src_10 as delay, src_11 as sequence, src_12 as parallel, src_13 as stagger, src_14 as event, src_15 as isAnimated, src_16 as createAnimatedComponent, src_17 as inject, src_18 as __PropsOnlyForTests };
