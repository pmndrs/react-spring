'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'))
var _objectWithoutPropertiesLoose = _interopDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var _inheritsLoose = _interopDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)
var React = _interopDefault(require('react'))
var renderprops = require('react-spring/renderprops')

var El = renderprops.Globals.defaultElement
var AnimatedDiv = renderprops.animated(El)

var _React$createContext = React.createContext(null),
  Provider = _React$createContext.Provider,
  Consumer = _React$createContext.Consumer

function getScrollType(horizontal) {
  return horizontal ? 'scrollLeft' : 'scrollTop'
}

var START_TRANSLATE_3D = 'translate3d(0px,0px,0px)'
var START_TRANSLATE = 'translate(0px,0px)'
var ParallaxLayer =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inheritsLoose(ParallaxLayer, _React$PureComponent)

    function ParallaxLayer() {
      return _React$PureComponent.apply(this, arguments) || this
    }

    var _proto = ParallaxLayer.prototype

    _proto.componentDidMount = function componentDidMount() {
      var parent = this.parent

      if (parent) {
        parent.layers = parent.layers.concat(this)
        parent.update()
      }
    }

    _proto.componentWillUnmount = function componentWillUnmount() {
      var _this = this

      var parent = this.parent

      if (parent) {
        parent.layers = parent.layers.filter(function(layer) {
          return layer !== _this
        })
        parent.update()
      }
    }

    _proto.setPosition = function setPosition(height, scrollTop, immediate) {
      if (immediate === void 0) {
        immediate = false
      }

      var config = this.parent.props.config
      var targetScroll = Math.floor(this.props.offset) * height
      var offset = height * this.props.offset + targetScroll * this.props.speed
      var to = parseFloat(-(scrollTop * this.props.speed) + offset)
      this.controller.update({
        translate: to,
        config: config,
        immediate: immediate,
      })
    }

    _proto.setHeight = function setHeight(height, immediate) {
      if (immediate === void 0) {
        immediate = false
      }

      var config = this.parent.props.config
      var to = parseFloat(height * this.props.factor)
      this.controller.update({
        space: to,
        config: config,
        immediate: immediate,
      })
    }

    _proto.initialize = function initialize() {
      var props = this.props
      var parent = this.parent
      var targetScroll = Math.floor(props.offset) * parent.space
      var offset = parent.space * props.offset + targetScroll * props.speed
      var to = parseFloat(-(parent.current * props.speed) + offset)
      this.controller = new renderprops.Controller({
        space: parent.space * props.factor,
        translate: to,
      })
    }

    _proto.renderLayer = function renderLayer() {
      var _extends2

      var _this$props = this.props,
        style = _this$props.style,
        children = _this$props.children,
        offset = _this$props.offset,
        speed = _this$props.speed,
        factor = _this$props.factor,
        className = _this$props.className,
        props = _objectWithoutPropertiesLoose(_this$props, [
          'style',
          'children',
          'offset',
          'speed',
          'factor',
          'className',
        ])

      var horizontal = this.parent.props.horizontal
      var translate3d = this.controller.interpolations.translate.interpolate(
        function(x) {
          return horizontal
            ? 'translate3d(' + x + 'px,0,0)'
            : 'translate3d(0,' + x + 'px,0)'
        }
      )
      return React.createElement(
        AnimatedDiv,
        _extends({}, props, {
          className: className,
          style: _extends(
            ((_extends2 = {
              position: 'absolute',
              backgroundSize: 'auto',
              backgroundRepeat: 'no-repeat',
              willChange: 'transform',
            }),
            (_extends2[horizontal ? 'height' : 'width'] = '100%'),
            (_extends2[
              horizontal ? 'width' : 'height'
            ] = this.controller.interpolations.space),
            (_extends2.WebkitTransform = translate3d),
            (_extends2.MsTransform = translate3d),
            (_extends2.transform = translate3d),
            _extends2),
            style
          ),
        }),
        children
      )
    }

    _proto.render = function render() {
      var _this2 = this

      return React.createElement(Consumer, null, function(parent) {
        if (parent && !_this2.parent) {
          _this2.parent = parent

          _this2.initialize()
        }

        return _this2.renderLayer()
      })
    }

    return ParallaxLayer
  })(React.PureComponent)
ParallaxLayer.defaultProps = {
  factor: 1,
  offset: 0,
  speed: 0,
}
var Parallax =
  /*#__PURE__*/
  (function(_React$PureComponent2) {
    _inheritsLoose(Parallax, _React$PureComponent2)

    // TODO keep until major release
    function Parallax(props) {
      var _this3

      _this3 = _React$PureComponent2.call(this) || this

      _this3.moveItems = function() {
        _this3.layers.forEach(function(layer) {
          return layer.setPosition(_this3.space, _this3.current)
        })

        _this3.busy = false
      }

      _this3.scrollerRaf = function() {
        return renderprops.Globals.requestFrame(_this3.moveItems)
      }

      _this3.onScroll = function(event) {
        var horizontal = _this3.props.horizontal

        if (!_this3.busy) {
          _this3.busy = true

          _this3.scrollerRaf()

          _this3.current = event.target[getScrollType(horizontal)]
        }
      }

      _this3.update = function() {
        var _this3$props = _this3.props,
          scrolling = _this3$props.scrolling,
          horizontal = _this3$props.horizontal
        var scrollType = getScrollType(horizontal)
        if (!_this3.container) return
        _this3.space =
          _this3.container[horizontal ? 'clientWidth' : 'clientHeight']
        if (scrolling) _this3.current = _this3.container[scrollType]
        else
          _this3.container[scrollType] = _this3.current =
            _this3.offset * _this3.space
        if (_this3.content)
          _this3.content.style[horizontal ? 'width' : 'height'] =
            _this3.space * _this3.props.pages + 'px'

        _this3.layers.forEach(function(layer) {
          layer.setHeight(_this3.space, true)
          layer.setPosition(_this3.space, _this3.current, true)
        })
      }

      _this3.updateRaf = function() {
        renderprops.Globals.requestFrame(_this3.update) // Some browsers don't fire on maximize

        setTimeout(_this3.update, 150)
      }

      _this3.scrollStop = function(event) {
        return _this3.controller.stop()
      }

      _this3.state = {
        ready: false,
      }
      _this3.layers = []
      _this3.space = 0
      _this3.current = 0
      _this3.offset = 0
      _this3.busy = false
      _this3.controller = new renderprops.Controller({
        scroll: 0,
      })
      return _this3
    }

    var _proto2 = Parallax.prototype

    _proto2.scrollTo = function scrollTo(offset) {
      var _this$props2 = this.props,
        horizontal = _this$props2.horizontal,
        config = _this$props2.config
      var scrollType = getScrollType(horizontal)
      this.scrollStop()
      this.offset = offset
      var target = this.container
      this.controller.update({
        scroll: offset * this.space,
        config: config,
        onFrame: function onFrame(_ref) {
          var scroll = _ref.scroll
          return (target[scrollType] = scroll)
        },
      })
    }

    _proto2.componentDidMount = function componentDidMount() {
      window.addEventListener('resize', this.updateRaf, false)
      this.update()
      this.setState({
        ready: true,
      })
    }

    _proto2.componentWillUnmount = function componentWillUnmount() {
      window.removeEventListener('resize', this.updateRaf, false)
    }

    _proto2.componentDidUpdate = function componentDidUpdate() {
      this.update()
    }

    _proto2.render = function render() {
      var _this4 = this,
        _extends3

      var _this$props3 = this.props,
        style = _this$props3.style,
        innerStyle = _this$props3.innerStyle,
        pages = _this$props3.pages,
        id = _this$props3.id,
        className = _this$props3.className,
        scrolling = _this$props3.scrolling,
        children = _this$props3.children,
        horizontal = _this$props3.horizontal
      var overflow = scrolling ? 'scroll' : 'hidden'
      return React.createElement(
        El,
        {
          ref: function ref(node) {
            return (_this4.container = node)
          },
          onScroll: this.onScroll,
          onWheel: scrolling ? this.scrollStop : null,
          onTouchStart: scrolling ? this.scrollStop : null,
          style: _extends(
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              overflow: overflow,
              overflowY: horizontal ? 'hidden' : overflow,
              overflowX: horizontal ? overflow : 'hidden',
              WebkitOverflowScrolling: 'touch',
              WebkitTransform: START_TRANSLATE,
              MsTransform: START_TRANSLATE,
              transform: START_TRANSLATE_3D,
            },
            style
          ),
          id: id,
          className: className,
        },
        this.state.ready &&
          React.createElement(
            El,
            {
              ref: function ref(node) {
                return (_this4.content = node)
              },
              style: _extends(
                ((_extends3 = {
                  position: 'absolute',
                }),
                (_extends3[horizontal ? 'height' : 'width'] = '100%'),
                (_extends3.WebkitTransform = START_TRANSLATE),
                (_extends3.MsTransform = START_TRANSLATE),
                (_extends3.transform = START_TRANSLATE_3D),
                (_extends3.overflow = 'hidden'),
                (_extends3[horizontal ? 'width' : 'height'] =
                  this.space * pages),
                _extends3),
                innerStyle
              ),
            },
            React.createElement(
              Provider,
              {
                value: this,
              },
              children
            )
          )
      )
    }

    return Parallax
  })(React.PureComponent)
Parallax.Layer = ParallaxLayer
Parallax.defaultProps = {
  config: renderprops.config.slow,
  scrolling: true,
  horizontal: false,
}

exports.Parallax = Parallax
exports.ParallaxLayer = ParallaxLayer
