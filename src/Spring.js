import React from 'react'
import PropTypes from 'prop-types'
import memoize from 'memoize-one'
import controller from './animated/AnimatedController'
import AnimatedValue from './animated/AnimatedValue'
import AnimatedArray from './animated/AnimatedArray'
import AnimatedProps from './animated/AnimatedProps'
import SpringAnimation from './animated/SpringAnimation'
import * as Globals from './animated/Globals'
import {
  renderChildren,
  convertValues,
  callProp,
  shallowEqual,
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

  didUpdate = false
  didInject = false
  animations = {}
  interpolators = {}
  lastChildren = { children: undefined, render: undefined }

  forceUpdate() {
    this.forcingUpdate = true
    super.forceUpdate()
  }

  componentDidMount() {
    // componentDidUpdate isn't called on mount, we call it here to start animating
    this.componentDidUpdate()
    this.mounted = true
  }

  componentWillUnmount() {
    // Stop all ongoing animtions
    this.mounted = false
    this.stopAnimations()
  }

  startAnimations = () => {
    if (this.props.onStart) this.props.onStart()
    Object.keys(this.animations).forEach(this.animationStart)
  }

  stopAnimations = () =>
    getValues(this.animations).forEach(({ animation }) =>
      animation.stopAnimation()
    )

  animationOnFinish = (name, cb) => {
    if (!this.mounted) return
    const { animation, toValue: to } = this.animations[name]
    this.animations[name].stopped = true
    if (getValues(this.animations).every(a => a.stopped)) {
      const current = { ...this.props.from, ...this.props.to }
      if (this.props.onRest) this.props.onRest(current)
      cb && typeof cb === 'function' && cb(current)

      // Restore end-state
      if (this.didInject) {
        this.afterInject = convertValues(this.props)
        this.didInject = false
        this.forceUpdate()
      }
    }
  }

  animationStart = (name, cb) => {
    const { config, impl } = this.props
    const { animation, toValue: to } = this.animations[name]
    // TODO: figure out why this is needed ...
    if (!to.__getValue && animation.__getValue() === to)
      return this.animationOnFinish(name, cb)
    controller(animation, { to, ...callProp(config, name) }, impl).start(
      !to.__getValue &&
        (props => props.finished && this.animationOnFinish(name, cb))
    )
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

  updateAnimations({
    text,
    from,
    to,
    attach,
    reset,
    immediate,
    onFrame,
    native,
  }) {
    // Attachment handling, trailed springs can "attach" themselves to a previous spring
    const target = attach && attach(this)

    const allProps = Object.entries({ ...from, ...to })
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
    const oldAnimatedProps = this.animatedProps
    this.animatedProps = new AnimatedProps(this.interpolators, () => {
      // This gets called on every animation frame ...
      if (onFrame) onFrame(this.animatedProps.__getValue())
      if (!native) this.forceUpdate()
    })
    oldAnimatedProps && oldAnimatedProps.__detach()

    // Flag an update that occured, componentDidUpdate will start the animation later
    this.didUpdate = true
    this.afterInject = undefined
    this.didInject = false
  }

  componentDidUpdate() {
    const { delay } = this.props

    // Animation has to start *after* render, since at that point the scene
    // graph should be established, so we do it here. Unfortunatelly, non-native
    // animations call forceUpdate, so it's causing a loop. updateToken prevents
    // that as it gets set only on prop changes.
    if (this.didUpdate) {
      if (delay) {
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.startAnimations, delay)
      } else this.startAnimations()
    }

    this.forcingUpdate = this.didUpdate = false
  }

  // The following is a memoized test against props that could alter the animation
  __tick = 0
  __increaseUpdateTick = memoize(() => this.__tick++, shallowEqual)
  didPropsChange() {
    const oldTick = this.__tick
    const { attach, from, to, immediate, onFrame, native } = this.props
    this.__increaseUpdateTick(from, to, {
      attach,
      immediate,
      onFrame,
      native,
    })
    return oldTick !== this.__tick
  }

  render() {
    const { inject, reset } = this.props
    const propsChanged =
      this.didPropsChange() ||
      reset ||
      (this.props.force && !this.forcingUpdate)

    // Handle injected frames, for instance targets/web/fix-auto
    if (inject && propsChanged && !this.forcingUpdate) {
      const frame = inject(this.props, injectProps => {
        // The inject frame has rendered, now let's update animations...
        this.updateAnimations(injectProps)
        this.didInject = true
        // and cause a new render
        this.forceUpdate()
      })
      // Render out injected frame
      if (frame) return frame
    }

    // Update animations (memoized)
    if (propsChanged) this.updateAnimations(this.props)

    // Render
    const values = this.getAnimatedValues()

    return values && Object.keys(values).length
      ? renderChildren(this.props, {
          ...values,
          ...this.afterInject,
        })
      : null
  }
}
