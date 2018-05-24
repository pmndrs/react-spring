import React from 'react'
import PropTypes from 'prop-types'
import controller from './animated/AnimatedController'
import AnimatedValue from './animated/AnimatedValue'
import AnimatedArray from './animated/AnimatedArray'
import AnimatedProps from './animated/AnimatedProps'
import SpringAnimation from './animated/SpringAnimation'
import { colorNames } from './normalize-css-color/index'
import * as Globals from './animated/Globals'

export const config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
}

const callProp = (p, n) => (typeof p === 'function' ? p(n) : p)
const convert = (acc, [name, value]) => ({
  ...acc,
  [name]: new AnimatedValue(value),
})

export default class Spring extends React.PureComponent {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    from: PropTypes.object,
    native: PropTypes.bool,
    onRest: PropTypes.func,
    onFrame: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.node,
    ]),
    render: PropTypes.func,
    reset: PropTypes.bool,
    config: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    immediate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    hold: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    impl: PropTypes.func,
    inject: PropTypes.func,
  }

  static defaultProps = {
    from: {},
    to: {},
    config: config.default,
    native: false,
    immediate: false,
    hold: false,
    reset: false,
    impl: SpringAnimation,
    inject: Globals.Bugfixes,
  }

  state = { props: undefined }
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
      this.inject = props.inject(this, props)
      if (this.inject) return
    }
    this.updateProps(props)
  }

  updateProps(props, force = false, didInject = false) {
    // Springs can be destroyed, the "destroyed" flag prevents them from ever
    // updating further, they'll just animate out and function no more ...
    if (this.destroyed && props.destroyed) return
    this.destroyed = props.destroyed

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
      inject,
      native,
    } = props
    const allProps = Object.entries({ ...from, ...to })

    this.interpolators = {}
    this.animations = allProps.reduce((acc, [name, value], i) => {
      const entry =
        (reset === false && this.animations[name]) ||
        (this.animations[name] = {})

      let isNumber = typeof value === 'number'
      let isString =
        typeof value === 'string' && !/\d/.test(value) && !colorNames[value]
      let isArray = !isNumber && !isString && Array.isArray(value)
      let fromValue = from[name] !== undefined ? from[name] : value
      let fromAnimated = fromValue instanceof AnimatedValue
      let toValue = isNumber || isArray ? value : 1

      if (/*isNumber &&*/ attach) {
        // Attach value to target animation
        const target = attach(this)
        const targetAnimation = target && target.animations[name]
        if (targetAnimation) toValue = targetAnimation.animation
      }

      if (fromAnimated) {
        // Use provided animated value
        entry.animation = entry.interpolation = fromValue
      } else if (isNumber || isString) {
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
          entry.interpolation._interpolation(entry.animation._value)
        entry.animation = new AnimatedValue(0)
        entry.interpolation = entry.animation.interpolate({
          range: [0, 1],
          output: [previous !== undefined ? previous : fromValue, value],
        })
      }

      if (callProp(immediate, name)) entry.animation.setValue(toValue)

      entry.stopped = false
      entry.onFinish = cb => {
        this.animations[name].stopped = true
        if (this.getAnimations().every(a => a.stopped)) {
          const current = { ...this.props.from, ...this.props.to }
          onRest && onRest(current)
          cb && typeof cb === 'function' && cb(current)

          if (didInject) {
            // Restore the original values for injected props
            const componentProps = this.convertValues(this.props)
            this.inject = this.renderChildren(this.props, componentProps)
            this.forceUpdate()
          }
        }
      }
      entry.start = cb => {
        // Skip held animations
        if (callProp(hold, name)) return entry.onFinish(cb)

        controller(
          entry.animation,
          { to: toValue, ...callProp(config, name) },
          impl
        ).start(props => props.finished && entry.onFinish(cb))
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

    this.updateToken = true
    if (force) this.forceUpdate()
  }

  start() {
    let fn = () =>
      this.getAnimations().forEach(animation => animation.start(resolve))
    let resolve,
      promise = new Promise(r => (resolve = r))

    if (this.props.delay) {
      if (this.timeout) clearTimeout(this.timeout)
      return (this.timeout = setTimeout(() => fn(), this.props.delay))
    }

    fn()
    return promise
  }

  stop() {
    this.getAnimations().forEach(animation => animation.stop())
  }

  flush() {
    this.getAnimations().forEach(
      ({ interpolation }) => interpolation._update && interpolation._update()
    )
  }

  callback = () => {
    if (this.props.onFrame) this.props.onFrame(this.animatedProps.__getValue())
    !this.props.native && this.forceUpdate()
  }

  getAnimations() {
    return Object.keys(this.animations).map(key => this.animations[key])
  }

  getValues() {
    return this.animatedProps ? this.animatedProps.__getValue() : {}
  }

  getAnimatedValues() {
    return this.props.native ? this.interpolators : this.getValues()
  }

  convertValues(props) {
    const { from, to, native, children, render } = props
    const forward = this.getForwardProps(props)
    const allProps = Object.entries({ ...from, ...to })
    return native
      ? allProps.reduce(convert, forward)
      : { ...from, ...to, ...forward }
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
      hold,
      ...forward
    } = props
    return forward
  }

  componentDidUpdate() {
    // Animation has to start *after* render, since at that point the scene
    // graph should be established, so we do it here. Unfortunatelly, non-native
    // animations call forceUpdate, so it's causing a loop. updateToken prevents
    // that as it gets set only on prop changes.
    if (this.updateToken) {
      this.updateToken = false
      this.start()
    }
  }

  componentDidMount() {
    this.start()
  }

  renderChildren(props, componentProps) {
    return props.render
      ? props.render({ ...componentProps, children: props.children })
      : props.children(componentProps)
  }

  render() {
    if (this.inject) {
      const content = this.inject
      this.inject = undefined
      return content
    }

    const { children, render } = this.props
    const values = this.getAnimatedValues()
    return values && Object.keys(values).length
      ? this.renderChildren(this.props, {
          ...values,
          ...this.getForwardProps(),
        })
      : null
  }
}
