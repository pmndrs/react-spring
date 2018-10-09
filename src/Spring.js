import React from 'react'
import PropTypes from 'prop-types'
import AnimatedValue from './animated/AnimatedValue'
import AnimatedArray from './animated/AnimatedArray'
import AnimatedProps from './animated/AnimatedProps'
import AnimationController from './animated/AnimationController'
import springImpl from './impl/see'
import timingImpl from './impl/timing'
import * as Globals from './animated/Globals'
import { config } from './shared/constants'
import {
  renderChildren,
  convertValues,
  callProp,
  shallowEqual,
  getValues,
} from './shared/helpers'

const v = React.version.split('.')
if (process.env.NODE_ENV !== 'production' && (v[0] < 16 || v[1] < 4)) {
  console.warn(
    'Please consider upgrading to react/react-dom 16.4.x or higher! Older React versions break getDerivedStateFromProps, see https://github.com/facebook/react/issues/12898'
  )
}

export default class Spring extends React.Component {
  static propTypes = {
    /** Base values, optional */
    from: PropTypes.object,
    /** Animates to ... */
    to: PropTypes.object,
    /** Props it can optionally apply after the animation is concluded ... */
    after: PropTypes.object,
    /** Takes a function that receives interpolated styles */
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.node,
    ]),
    /** Delay in ms before the animation starts (config.delay takes precedence if present) */
    delay: PropTypes.number,
    /** Prevents animation if true, or for individual keys: fn(key => true/false) */
    immediate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    /** When true the spring starts from scratch (from -> to) */
    reset: PropTypes.bool,
    /** When true "from" and "to" are switched, this will only make sense in combination with the "reset" flag */
    reverse: PropTypes.bool,
    /** Spring config, or for individual keys: fn(key => config) */
    config: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Will skip rendering the component if true and write to the dom directly */
    native: PropTypes.bool,
    /** Callback when the animation starts to animate */
    onStart: PropTypes.func,
    /** Callback when the animation comes to a still-stand */
    onRest: PropTypes.func,
    /** Frame by frame callback, first argument passed is the animated value */
    onFrame: PropTypes.func,
    /** The spring implementation is fully exchangeable (see addons) */
    impl: PropTypes.object,
    /** Escape hatch for cases where you supply the same values, but need spring to render anyway (see gotchas:auto) */
    force: PropTypes.bool,
    // Internal: Hooks, mostly used for middleware (like fix-auto)
    // inject: PropTypes.func,
  }

  static defaultProps = {
    from: {},
    to: {},
    config: config.default,
    native: false,
    immediate: false,
    reset: false,
    force: false,
    impl: undefined,
    inject: Globals.bugfixes,
  }

  state = {
    lastProps: { from: {}, to: {} },
    propsChanged: false,
    internal: false,
  }

  controller = new AnimationController()
  didUpdate = false
  didInject = false
  updating = false
  finished = true
  animations = {}
  interpolators = {}
  mergedProps = {}

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

  static getDerivedStateFromProps(props, { internal, lastProps }) {
    // The following is a test against props that could alter the animation
    const { from, to, reset, force } = props
    const propsChanged =
      !shallowEqual(to, lastProps.to) ||
      !shallowEqual(from, lastProps.from) ||
      (reset && !internal) ||
      (force && !internal)
    return { propsChanged, lastProps: props, internal: false }
  }

  render() {
    const propsChanged = this.state.propsChanged

    // Handle injected frames, for instance targets/web/fix-auto
    // An inject will return an intermediary React node which measures itself out
    // .. and returns a callback when the values sought after are ready, usually "auto".
    if (this.props.inject && propsChanged && !this.injectProps) {
      const frame = this.props.inject(this.props, injectProps => {
        // The inject frame has rendered, now let's update animations...
        this.injectProps = injectProps
        this.setState({ internal: true })
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
    let values = { ...this.getAnimatedValues(), ...this.afterInject }
    if (this.finished) values = { ...values, ...this.props.after }
    return values && Object.keys(values).length
      ? renderChildren(this.props, values)
      : null
  }

  componentDidUpdate() {
    // The animation has to start *after* render, since at that point the scene
    // .. graph should be established, so we do it here. Unfortunatelly, non-native
    // .. animations as well as "auto"-injects call forceUpdate, so it's causing a loop.
    // .. didUpdate prevents that as it gets set only on prop changes.
    if (this.didUpdate) this.start()
    this.didUpdate = false
  }

  updateAnimations({
    from,
    to,
    reverse,
    attach,
    reset,
    immediate,
    onFrame,
    native,
  }) {
    // This function will turn own-props into AnimatedValues, it tries to re-use
    // .. exsting animations as best as it can by detecting the changes made

    // We can potentially cause setState, but we're inside render, the flag prevents that
    this.updating = true

    // Reverse values when requested
    if (reverse) {
      ;[from, to] = [to, from]
    }

    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    let target = attach && attach(this)
    let animationsChanged = false

    // Reset merged props when necessary
    if (reset) this.mergedProps = {}
    // This will collect all props that were ever set
    this.mergedProps = { ...from, ...this.mergedProps, ...to }
    // Create or update current animation props
    this.animations = Object.entries(this.mergedProps).reduce(
      (acc, [name, value], i) => {
        const entry = (reset === false && acc[name]) || {}
        const isNumber = typeof value === 'number'
        const isString =
          typeof value === 'string' &&
          !value.startsWith('#') &&
          !/\d/.test(value) &&
          !Globals.colorNames[value]
        const isArray = !isNumber && !isString && Array.isArray(value)
        const fromValue = from[name] !== undefined ? from[name] : value
        const fromAnimated = fromValue instanceof AnimatedValue
        let toValue = isNumber || isArray ? value : isString ? value : 1

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
          },
        }
      },
      this.animations
    )

    // Update animated props (which from now on will take care of the animation)
    if (animationsChanged) {
      const oldAnimatedProps = this.animatedProps
      this.animatedProps = new AnimatedProps(this.interpolators, () => {
        // This gets called on every animation frame ...
        if (onFrame) onFrame(this.animatedProps.__getValue())
        if (!native && !this.updating) this.setState({ internal: true })
      })
      oldAnimatedProps && oldAnimatedProps.__detach()
    }

    // Flag an update that occured, componentDidUpdate will start the animation later on
    this.didUpdate = true
    this.afterInject = undefined
    this.didInject = false
    this.updating = false
  }

  start = () => {
    this.finished = false
    let wasMounted = this.mounted
    let { config, impl, delay } = this.props
    if (this.props.onStart) this.props.onStart()

    this.controller
      .set(
        Object.entries(this.animations).map(
          ([name, { animation: value, toValue: to }]) => ({
            value,
            to,
            delay,
            ...callProp(config, name),
          })
        ),
        impl ? impl : config.duration === void 0 ? springImpl : timingImpl
      )
      .start(props => this.finishAnimation({ ...props, wasMounted }))
  }

  stop = () => {
    this.controller.stop(true)
  }

  finishAnimation = ({ finished, noChange, wasMounted }) => {
    this.finished = true
    if (this.mounted && finished) {
      // Only call onRest if either we *were* mounted, or when there wer changes
      if (this.props.onRest && (wasMounted || !noChange))
        this.props.onRest(this.mergedProps)
      // Restore end-state
      if (this.didInject) this.afterInject = convertValues(this.props)

      // If we have an inject or values to apply after the animation we ping here
      if (this.mounted && (this.didInject || this.props.after))
        this.setState({ internal: true })
      this.didInject = false
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
