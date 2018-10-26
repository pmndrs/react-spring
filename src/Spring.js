import React from 'react'
import PropTypes from 'prop-types'
import Controller from './animated/Controller'
import * as Globals from './animated/Globals'
import { config } from './shared/constants'
import { convertValues, shallowEqual, getValues } from './shared/helpers'

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
    inject: Globals.bugfixes,
  }

  state = {
    lastProps: { from: {}, to: {} },
    propsChanged: false,
    internal: false,
  }

  controller = new Controller(null, null)
  didUpdate = false
  didInject = false
  updating = false
  finished = true

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
    const { native, onFrame, children } = this.props
    const propsChanged = this.state.propsChanged

    // Inject phase -----------------------------------------------------------

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

    // Update phase -----------------------------------------------------------

    // We can potentially cause setState, but we're inside render, the flag prevents that
    this.updating = true
    this.didInject = false

    // Update animations, this turns from/to props into AnimatedValues
    // An update can occur on injected props, or when own-props have changed.
    if (this.injectProps) {
      this.controller.update(this.injectProps)
      // didInject is needed, because there will be a 3rd stage, where the original values
      // .. will be restored after the animation is finished. When someone animates towards
      // .. "auto", the end-result should be "auto", not "1999px", which would block nested
      // .. height/width changes.
      this.didInject = true
    } else if (propsChanged) this.controller.update(this.props)

    if (this.injectProps || propsChanged) {
      // Flag an update that occured, componentDidUpdate will start the animation later on
      this.didUpdate = true
      this.afterInject = undefined
      this.injectProps = undefined
    }

    this.updating = false

    // Render phase -----------------------------------------------------------

    // Render out raw values or AnimatedValues depending on "native"
    let values = { ...this.controller.getValues(), ...this.afterInject }
    if (this.finished) values = { ...values, ...this.props.after }
    return values && Object.keys(values).length ? children(values) : null
  }

  componentDidUpdate() {
    // The animation has to start *after* render, since at that point the scene
    // .. graph should be established, so we do it here. Unfortunatelly, non-native
    // .. animations as well as "auto"-injects call forceUpdate, so it's causing a loop.
    // .. didUpdate prevents that as it gets set only on prop changes.
    if (this.didUpdate) this.start()
    this.didUpdate = false
  }

  start = () => {
    this.finished = false
    let wasMounted = this.mounted
    this.controller.start(
      props => this.finish({ ...props, wasMounted }),
      this.update
    )
  }

  stop = () => this.controller.stop(true)
  update = () => !this.updating && this.setState({ internal: true })
  finish = ({ finished, noChange, wasMounted }) => {
    this.finished = true
    if (this.mounted && finished) {
      // Only call onRest if either we *were* mounted, or when there wer changes
      if (this.props.onRest && (wasMounted || !noChange))
        this.props.onRest(this.controller.merged)

      // Restore end-state
      if (this.didInject) this.afterInject = convertValues(this.props)

      // If we have an inject or values to apply after the animation we ping here
      if (this.mounted && (this.didInject || this.props.after))
        this.setState({ internal: true })
      this.didInject = false
    }
  }
}

export function useSpring(props) {
  const state = React.useRef({
    controller: new Controller(props),
    finished: ({ finished }) =>
      finished && props.onRest && props.onRest(state.current.controller.merged),
  })
  React.useEffect(() => {
    state.current.controller.update(props, state.current.finished)
  })
  return [
    state.current.controller.interpolations,
    props => state.current.controller.update(props, state.current.finished),
  ]
}
