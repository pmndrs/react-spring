import React from 'react'
import PropTypes from 'prop-types'
import AnimatedController from './animated/AnimatedController'
import AnimatedValue from './animated/AnimatedValue'
import AnimatedArray from './animated/AnimatedArray'
import AnimatedProps from './animated/AnimatedProps'
import SpringAnimation from './animated/SpringAnimation'
import Globals from './animated/Globals'

export const config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
}

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
    inject: PropTypes.func,
  }

  static defaultProps = {
    from: {},
    to: {},
    config: config.default,
    native: false,
    immediate: false,
    reset: false,
    impl: SpringAnimation,
    inject: Globals.Bugfixes,
  }

  state = { props: undefined }
  defaultAnimation = new AnimatedValue(0)
  animations = {}

  componentWillUnmount() {
    this.stop()
  }

  componentWillMount() {
    this.updatePropsAsync(this.props)
  }

  componentWillReceiveProps(props) {
    this.updatePropsAsync(props)
  }

  updatePropsAsync(props) {
    if (props.inject) {
      props = props.inject(this, props)
      // This is in order to not waste time, if it isn't a promise, don't stall
      if (props.then) return props.then(props => this.updateProps(props, true))
    }
    this.updateProps(props)
  }

  updateProps(props, force = false) {
    const {
      impl,
      from,
      to,
      config,
      attach,
      immediate,
      hold,
      reset,
      onFrame,
      onRest,
    } = props
    const allProps = Object.entries({ ...from, ...to })
    const defaultAnimationValue = this.defaultAnimation._value

    this.defaultAnimation.setValue(0)
    this.interpolators = {}
    this.animations = allProps.reduce((acc, [name, value], i) => {
      const entry =
        (reset === false && this.animations[name]) ||
        (this.animations[name] = {})

      let isNumber = typeof value === 'number'
      let isArray = !isNumber && Array.isArray(value)
      let fromValue = from[name] !== undefined ? from[name] : value
      let fromAnimated = fromValue instanceof AnimatedValue
      let toValue = isNumber || isArray ? value : 1

      if (isNumber && attach) {
        // Attach value to target animation
        const target = attach(this)
        const targetAnimation = target && target.animations[name]
        if (targetAnimation) toValue = targetAnimation.animation
      }

      if (fromAnimated) {
        // Use provided animated value
        entry.animation = entry.interpolation = fromValue
      } else if (isNumber || toValue === 'auto') {
        // Create animated value
        entry.animation = entry.interpolation =
          entry.animation || new AnimatedValue(fromValue)
      } else if (isArray) {
        // Create animated array
        entry.animation = entry.interpolation =
          entry.animation || new AnimatedArray(fromValue)
      } else {
        // Deal with interpolations
        const previous =
          entry.interpolation &&
          entry.interpolation._interpolation(defaultAnimationValue)
        entry.animation = this.defaultAnimation
        entry.interpolation = this.defaultAnimation.interpolate({
          range: [0, 1],
          output: [previous !== undefined ? previous : fromValue, value],
        })
      }

      if (immediate && (immediate === true || immediate.indexOf(name) !== -1))
        entry.animation.setValue(toValue)

      entry.stopped = false
      entry.start = cb => {
        const onFinish = () => {
          this.animations[name].stopped = true
          if (
            Object.values(this.animations).every(animation => animation.stopped)
          ) {
            const current = { ...this.props.from, ...this.props.to }
            onRest && onRest(current)
            cb && cb(current)
          }
        }

        // Skip held animations
        if (hold && (hold === true || hold.indexOf(name) !== -1))
          return onFinish()

        AnimatedController(entry.animation, { toValue, ...config }, impl).start(
          props => props.finished && onFinish()
        )
      }
      entry.stop = () => {
        entry.stopped = true
        entry.animation.stopAnimation()
      }

      this.interpolators[name] = entry.interpolation
      return { ...acc, [name]: entry }
    }, {})

    const oldAnimatedProps = this.animatedProps
    this.animatedProps = new AnimatedProps(this.interpolators, this.callback)
    oldAnimatedProps && oldAnimatedProps.__detach()

    if (force) this.forceUpdate()
    this.start()
  }

  start() {
    return new Promise(res =>
      this.getAnimations().forEach(animation => animation.start(res))
    )
  }

  stop() {
    this.getAnimations().forEach(animation => animation.stop())
  }

  callback = () => {
    if (this.props.onFrame) this.props.onFrame(this.animatedProps.__getValue())
    !this.props.native && this.forceUpdate()
  }

  getAnimations() {
    return Object.values(this.animations)
  }

  getValues() {
    return this.animatedProps ? this.animatedProps.__getValue() : {}
  }

  getAnimatedValues() {
    return this.props.native ? this.interpolators : this.getValues()
  }

  getForwardProps(props = this.props) {
    const {
      to,
      from,
      config,
      native,
      onRest,
      onFrame,
      children,
      render,
      reset,
      immediate,
      impl,
      inject,
      ...forward
    } = props
    return forward
  }

  render() {
    const { children, render } = this.props
    const values = this.getAnimatedValues()
    if (values && Object.keys(values).length) {
      const animatedProps = {
        ...this.getAnimatedValues(),
        ...this.getForwardProps(),
      }
      return render
        ? render({ ...animatedProps, children })
        : children(animatedProps)
    } else return null
  }
}
