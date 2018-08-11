import React from 'react'
import PropTypes from 'prop-types'
import controller from './animated/AnimatedController'
import AnimatedValue from './animated/AnimatedValue'
import AnimatedArray from './animated/AnimatedArray'
import AnimatedProps from './animated/AnimatedProps'
import SpringAnimation from './animated/SpringAnimation'
import * as Globals from './animated/Globals'
import { config } from './targets/shared/constants'
import {
  renderChildren,
  convertValues,
  callProp,
  shallowEqual,
  getValues,
} from './targets/shared/helpers'

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
    force: PropTypes.bool,
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
    force: false,
    impl: SpringAnimation,
    inject: Globals.bugfixes,
  }

  state = {
    lastProps: { from: {}, to: {} },
    changed: false,
    dry: false,
  }

  didUpdate = false
  didInject = false
  animations = {}
  interpolators = {}

  componentDidMount() {
    // componentDidUpdate isn't called on mount, we call it here to start animating
    this.componentDidUpdate()
    this.mounted = true
  }

  componentWillUnmount() {
    // Stop all ongoing animtions
    this.mounted = false
    this.stop()
  }

  static getDerivedStateFromProps(props, { changed, dry, lastProps }) {
    // The following is a test against props that could alter the animation
    const { from, to, reset, force } = props
    changed =
      !shallowEqual(to, lastProps.to) ||
      !shallowEqual(from, lastProps.from) ||
      reset ||
      (force && !dry)
    return { changed, lastProps: props, dry: false }
  }

  render() {
    const propsChanged = this.state.changed

    // Handle injected frames, for instance targets/web/fix-auto
    // An inject will return an intermediary React node which measures itself out
    // .. and returns a callback when the values sought after are ready, usually "auto".
    if (this.props.inject && propsChanged && !this.injectProps) {
      const frame = this.props.inject(this.props, injectProps => {
        // The inject frame has rendered, now let's update animations...
        this.injectProps = injectProps
        this.setState({ dry: true })
      })
      // Render out injected frame
      if (frame) return frame
    }

    // Update animations, this turns from/to props into AnimatedValues
    // An update can occur on injected props, or when own-props have changed.
    if (this.injectProps) {
      this.updateAnimations(this.injectProps)
      this.injectProps = undefined
      // didInject is needed, because there will be a 3rd stage, where the original values
      // .. will be restored after the animation is finished. When someone animates towards
      // .. "auto", the end-result should be "auto", not "1999px", which would block nested
      // .. height/width changes.
      this.didInject = true
    } else if (propsChanged) this.updateAnimations(this.props)

    // Render out raw values or AnimatedValues depending on "native"
    const values = this.getAnimatedValues()
    return values && Object.keys(values).length
      ? renderChildren(this.props, {
          ...values,
          ...this.afterInject,
        })
      : null
  }

  componentDidUpdate() {
    // The animation has to start *after* render, since at that point the scene
    // .. graph should be established, so we do it here. Unfortunatelly, non-native
    // .. animations as well as "auto" injects call forceUpdate, so it's causing a loop.
    // .. didUpdate prevents that as it gets set only on prop changes.
    if (this.didUpdate) {
      if (this.props.delay) {
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.start, this.props.delay)
      } else this.start()
    }
    this.didUpdate = false
  }

  updateAnimations({ from, to, attach, reset, immediate, onFrame, native }) {
    // This function will turn own-props into AnimatedValues, it tries to re-use
    // .. exsting animations as best as it can by detecting the changes made

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    let target = attach && attach(this)

    let animationsChanged = false
    let allProps = Object.entries({ ...from, ...to })
    this.animations = allProps.reduce((acc, [name, value], i) => {
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
        const attachedAnimation = target.animations[name]
        if (attachedAnimation) toValue = attachedAnimation.animation
      }

      let old = entry.animation
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

        if (entry.animation) {
          animation = entry.animation
          animation.setValue(0)
        } else animation = new AnimatedValue(0)

        const config = {
          range: [0, 1],
          output: [previous !== undefined ? previous : fromValue, value],
        }
        if (entry.interpolation)
          interpolation = entry.interpolation.__update(config)
        else interpolation = animation.interpolate(config)
      }

      if (old !== animation) animationsChanged = true

      // Set immediate values
      if (callProp(immediate, name)) animation.setValue(toValue)

      // Save interpolators
      this.interpolators = { ...this.interpolators, [name]: interpolation }

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
    }, this.animations)

    // Update animated props (which from now on will take care of the animation)
    if (animationsChanged) {
      const oldAnimatedProps = this.animatedProps
      this.animatedProps = new AnimatedProps(this.interpolators, () => {
        // This gets called on every animation frame ...
        if (onFrame) onFrame(this.animatedProps.__getValue())
        if (!native) this.setState({ dry: true })
      })
      oldAnimatedProps && oldAnimatedProps.__detach()
    }

    // Flag an update that occured, componentDidUpdate will start the animation later on
    this.didUpdate = true
    this.afterInject = undefined
    this.didInject = false
  }

  start = () => {
    const { config, impl } = this.props
    if (this.props.onStart) this.props.onStart()
    Object.keys(this.animations).forEach(name => {
      const { animation, toValue: to } = this.animations[name]
      // TODO: figure out why this is needed ...
      if (!to.__getValue && animation.__getValue() === to)
        return this.finishAnimation(name)
      controller(animation, { to, ...callProp(config, name) }, impl).start(
        !to.__getValue &&
          (props => props.finished && this.finishAnimation(name))
      )
    })
  }

  stop = () =>
    getValues(this.animations).forEach(({ animation }) =>
      animation.stopAnimation()
    )

  finishAnimation = name => {
    if (!this.mounted) return
    const { animation, toValue: to } = this.animations[name]
    this.animations[name].stopped = true
    if (getValues(this.animations).every(a => a.stopped)) {
      const current = { ...this.props.from, ...this.props.to }
      if (this.props.onRest) this.props.onRest(current)

      // Restore end-state
      if (this.didInject) {
        this.afterInject = convertValues(this.props)
        this.didInject = false
        this.setState({ dry: true })
      }
    }
  }

  flush() {
    getValues(this.animations).forEach(
      ({ animation }) => animation._update && animation._update()
    )
  }

  getValues() {
    return this.animatedProps ? this.animatedProps.__getValue() : {}
  }

  getAnimatedValues() {
    return this.props.native ? this.interpolators : this.getValues()
  }
}
