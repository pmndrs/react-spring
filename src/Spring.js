import React from 'react'
import PropTypes from 'prop-types'
import controller from './animated/AnimatedController'
import AnimatedValue from './animated/AnimatedValue'
import AnimatedArray from './animated/AnimatedArray'
import AnimatedProps from './animated/AnimatedProps'
import SpringAnimation from './animated/SpringAnimation'
import * as Globals from './animated/Globals'
import {
  renderChildren,
  getForwardProps,
  convertValues,
  callProp,
  shallowDiff,
  getValues,
} from './targets/shared/helpers'

export const config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
}

export default class Spring extends React.Component {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    from: PropTypes.object,
    native: PropTypes.bool,
    onStart: PropTypes.func,
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
    impl: PropTypes.func,
    inject: PropTypes.func,
    delay: PropTypes.number,
  }

  static defaultProps = {
    from: {},
    to: {},
    config: config.default,
    native: false,
    immediate: false,
    reset: false,
    impl: SpringAnimation,
    inject: Globals.bugfixes,
  }

  constructor(props) {
    super(props)
    const oldSetState = this.setState.bind(this)

    this.state = {
      // Animation look-up
      animations: {},
      // Interpolator fast acccess
      interpolators: {},
      // Last props
      last: {},
      // Dry => local setState calls that shouldn't cause rendering
      dry: false,
      // For setState calls that need to render
      skipRender: false,
      // Tells the render function that animation props have changed
      update: false,

      // Function that updates state without causing render passes
      updateState: (arg, skipRender = true, cb) =>
        oldSetState(
          state => ({ ...callProp(arg, state), dry: true, skipRender }),
          cb
        ),
    }
  }

  componentDidMount() {
    // componentDidUpdate isn't called on mount, we call it here to start animating
    this.componentDidUpdate()
  }

  componentWillUnmount() {
    // Stop all ongoing animtions
    this.stopAnimations()
  }

  shouldComponentUpdate(_, nextState) {
    // Do not render component on dry setState (internal state mgmnt)
    return !nextState.skipRender
  }

  componentDidUpdate() {
    const { delay, onStart } = this.props
    const { update, updateState, animations } = this.state

    // Animation has to start *after* render, since at that point the scene
    // graph should be established, so we do it here. Unfortunatelly, non-native
    // animations call forceUpdate, so it's causing a loop. updateToken prevents
    // that as it gets set only on prop changes.
    if (update) {
      if (delay) {
        if (this.timeout) clearTimeout(this.timeout)
        return (this.timeout = setTimeout(this.startAnimations, delay))
      }
      if (onStart) onStart()
      this.startAnimations()
      updateState({ update: false })
    }
  }

  static getDerivedStateFromProps(props, state) {
    let {
      dry,
      skipRender,
      animations,
      interpolators,
      last,
      override,
      tempFrame,
      updateState,
    } = state
    let { from, to, attach, immediate, reset, inject, children } =
      override || props

    let defaults = {
      dry: false,
      update: false,
      skipRender: false,
      injectFrame: undefined,
      tempFrame: undefined,
      override: undefined,
    }

    // Dry state-updates should update state without animation changes and rendering
    if (dry && !override && !shallowDiff(to, last.to))
      return { ...defaults, skipRender, injectFrame: tempFrame }

    // Handle injected frames, for instance targets/web/fix-auto
    const frame = inject && !override && inject(props, updateState)
    if (frame) return { injectFrame: frame, skipRender: false }

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    const target = attach && attach(() => animations)

    const allProps = Object.entries({ ...from, ...to })
    animations = allProps.reduce((acc, [name, value], i) => {
      const entry = (reset === false && acc[name]) || { stopped: true }
      const isNumber = typeof value === 'number'
      const isString =
        typeof value === 'string' &&
        !value.startsWith('#') &&
        !/\d/.test(value) &&
        !Globals.colorNames[value]
      const isArray = !isNumber && !isString && Array.isArray(value)
      const fromValue = from[name] !== undefined ? from[name] : value
      const fromAnimated = fromValue instanceof AnimatedValue
      let toValue = isNumber || isArray ? value : 1

      if (target) {
        // Attach value to target animation
        const attachedAnimation = target()[name]
        if (attachedAnimation) toValue = attachedAnimation.animation
      }

      let animation, interpolation
      if (fromAnimated) {
        // Use provided animated value
        animation = interpolation = fromValue
      } else if (isNumber || isString) {
        // Create animated value
        animation = interpolation =
          entry.animation || new AnimatedValue(fromValue)
      } else if (isArray) {
        // Create animated array
        animation = interpolation =
          entry.animation || new AnimatedArray(fromValue)
      } else {
        // Deal with interpolations
        const previous =
          entry.interpolation &&
          entry.interpolation._interpolation(entry.animation._value)
        animation = new AnimatedValue(0)
        interpolation = animation.interpolate({
          range: [0, 1],
          output: [previous !== undefined ? previous : fromValue, value],
        })
      }

      // Set immediate values
      if (callProp(immediate, name)) animation.setValue(toValue)

      // Save interpolators
      interpolators = { ...interpolators, [name]: interpolation }

      return {
        ...acc,
        [name]: {
          ...entry,
          name,
          animation,
          interpolation,
          toValue,
          stopped: false,
        },
      }
    }, animations)

    return { ...defaults, animations, interpolators, update: true, last: props }
  }

  startAnimations = () =>
    Object.keys(this.state.animations).forEach(this.animationStart)

  stopAnimations = () =>
    getValues(this.state.animations).forEach(({ animation }) =>
      animation.stopAnimation()
    )

  animationOnFinish = (name, cb) => {
    const { animation, toValue: to } = this.state.animations[name]

    this.animationStop(name)
    if (getValues(this.state.animations).every(a => a.stopped)) {
      const current = { ...this.props.from, ...this.props.to }
      if (this.props.onRest) this.props.onRest(current)
      cb && typeof cb === 'function' && cb(current)
      // Restore end-state
      const componentProps = convertValues(this.props)
      this.state.updateState(
        { tempFrame: renderChildren(this.props, componentProps) },
        false
      )
    }
  }

  animationStart = (name, cb) => {
    const { config, impl } = this.props
    const { animation, toValue: to } = this.state.animations[name]
    // TODO: figure out why this is needed ...
    if (!to.__getValue && animation.__getValue() === to)
      return this.animationOnFinish(name, cb)
    controller(animation, { to, ...callProp(config, name) }, impl).start(
      !to.__getValue &&
        (props => props.finished && this.animationOnFinish(name, cb))
    )
  }

  animationStop = name => {
    const { animation } = this.state.animations[name]
    this.state.updateState(state => ({
      ...state,
      animations: {
        ...state.animations,
        [name]: { ...state.animations[name], stopped: true },
      },
    }))
  }

  callback = () => {
    if (this.props.onFrame) this.props.onFrame(this.animatedProps.__getValue())
    if (!this.props.native) this.state.updateState({}, false)
  }

  flush() {
    getValues(this.state.animations).forEach(
      ({ animation }) => animation._update && animation._update()
    )
  }

  getValues() {
    return this.animatedProps ? this.animatedProps.__getValue() : {}
  }

  getAnimatedValues() {
    return this.props.native ? this.state.interpolators : this.getValues()
  }

  render() {
    const { children, render } = this.props
    const { update, interpolators, injectFrame } = this.state

    if (update) {
      const oldAnimatedProps = this.animatedProps
      this.animatedProps = new AnimatedProps(interpolators, this.callback)
      oldAnimatedProps && oldAnimatedProps.__detach()
    }

    // If an inject plugin has overtaken content (for a single frame)
    if (injectFrame) return injectFrame

    const values = this.getAnimatedValues()
    return values && Object.keys(values).length
      ? renderChildren(this.props, {
          ...values,
          ...getForwardProps(this.props),
        })
      : null
  }
}
