import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'
import SpringAnimation from './animated/SpringAnimation'

const animated = Animated.elements
const template = Animated.template
const interpolate = Animated.interpolate
const config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
}

export { config, template, animated, interpolate }

export default class Spring extends React.PureComponent {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    from: PropTypes.object,
    config: PropTypes.object,
    native: PropTypes.bool,
    onRest: PropTypes.func,
    onFrame: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
    ]),
    render: PropTypes.func,
    reset: PropTypes.bool,
    immediate: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    impl: PropTypes.func,
  }

  static defaultProps = {
    from: {},
    to: {},
    config: config.default,
    native: false,
    immediate: false,
    reset: false,
    impl: SpringAnimation,
  }

  constructor(props) {
    super()
    this._defaultAnimation = new Animated.Value(0)
    this._animations = {}
    this._updateProps(props, false)
  }

  _updateProps(
    { impl, from, to, config, attach, immediate, reset, onFrame, onRest },
    start = false
  ) {
    const allProps = Object.entries({ ...from, ...to })
    const defaultAnimationValue = this._defaultAnimation._value

    this._interpolators = {}
    this._defaultAnimation.setValue(0)
    this._animations = allProps.reduce((acc, [name, value], i) => {
      const entry =
        (reset === false && this._animations[name]) ||
        (this._animations[name] = {})
      let isNumber = typeof value === 'number'
      let isArray = !isNumber && Array.isArray(value)
      let fromValue = from[name] !== undefined ? from[name] : value
      let toValue = isNumber || isArray ? value : 1

      if (isNumber && attach) {
        // Attach value to target animation
        const target = attach(this)
        const targetAnimation = target && target._animations[name]
        if (targetAnimation) toValue = targetAnimation.animation
      }

      if (isNumber) {
        // Create animated value
        entry.animation = entry.interpolation =
          entry.animation || new Animated.Value(fromValue)
      } else if (isArray) {
        // Create animated array
        entry.animation = entry.interpolation =
          entry.animation || new Animated.Array(fromValue)
      } else {
        // Deal with interpolations
        const previous =
          entry.interpolation &&
          entry.interpolation._interpolation(defaultAnimationValue)
        entry.animation = this._defaultAnimation
        entry.interpolation = this._defaultAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [previous !== undefined ? previous : fromValue, value],
        })
      }

      if (immediate && (immediate === true || immediate.indexOf(name) !== -1))
        entry.animation.setValue(toValue)

      entry.stopped = false
      entry.start = cb => {
        Animated.controller(
          entry.animation,
          { toValue, ...config },
          impl
        ).start(props => {
          if (props.finished) {
            this._animations[name].stopped = true
            if (
              Object.values(this._animations).every(
                animation => animation.stopped
              )
            ) {
              const current = { ...this.props.from, ...this.props.to }
              onRest && onRest(current)
              cb && cb(current)
            }
          }
        })
      }
      entry.stop = () => {
        entry.stopped = true
        entry.animation.stopAnimation()
      }

      this._interpolators[name] = entry.interpolation
      return { ...acc, [name]: entry }
    }, {})

    if (start) this.start()

    var oldPropsAnimated = this._propsAnimated
    this._propsAnimated = new Animated.AnimatedProps(
      this._interpolators,
      this.callback
    )
    oldPropsAnimated && oldPropsAnimated.__detach()
  }

  start(props = this.props) {
    return new Promise(res =>
      Object.values(this._animations).forEach(animation => animation.start(res))
    )
  }

  stop() {
    Object.values(this._animations).forEach(animation => animation.stop())
  }

  update(props) {
    this._updateProps({ ...this.props, ...props }, true)
  }

  callback = () => {
    if (this.props.onFrame) this.props.onFrame(this._propsAnimated.__getValue())
    !this.props.native && this.forceUpdate()
  }

  componentWillReceiveProps(props) {
    this._updateProps(props, true)
  }

  componentDidMount() {
    this.start()
  }

  componentWillUnmount() {
    this.stop()
  }

  getValues() {
    return this._propsAnimated.__getValue()
  }

  render() {
    const { children, render, from, to, config, native, ...extra } = this.props
    let animatedProps = {
      ...(native ? this._interpolators : this._propsAnimated.__getValue()),
      ...extra,
    }
    if (render) return render({ ...animatedProps, children })
    else
      return Array.isArray(children)
        ? children.map(child => child(animatedProps))
        : children(animatedProps)
  }
}
