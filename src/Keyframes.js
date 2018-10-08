import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import Trail from './Trail'
import { getForwardProps, shallowEqual } from './shared/helpers'
import { config as springConfig } from './shared/constants'

const DEFAULT = '__default'

class KeyframesImpl extends React.PureComponent {
  static propTypes = {
    /** Name of the active slot */
    state: PropTypes.string,
  }
  static defaultProps = { state: DEFAULT }

  guid = 0
  state = { props: {}, oldProps: {}, resolve: () => null, last: true }

  componentDidMount() {
    this.mounted = true
    this.componentDidUpdate({})
  }

  componentWillUnmount() {
    this.mounted = false
  }

  next = (props, last = true) => {
    this.running = true
    return new Promise(resolve => {
      this.mounted &&
        this.setState(
          state => ({
            props,
            oldProps: { ...this.state.props },
            resolve,
            last,
          }),
          () => (this.running = false)
        )
    })
  }

  componentDidUpdate(previous) {
    const { states, filter: f, state } = this.props
    if (
      previous.state !== this.props.state ||
      (this.props.reset && !this.running) ||
      !shallowEqual(states[state], previous.states[previous.state])
    ) {
      if (states && state && states[state]) {
        const localId = ++this.guid
        const slots = states[state]
        if (slots) {
          if (Array.isArray(slots)) {
            let q = Promise.resolve()
            for (let i = 0; i < slots.length; i++) {
              let s = slots[i]
              q = q.then(
                () =>
                  localId === this.guid &&
                  this.next(f(s), i === slots.length - 1)
              )
            }
          } else if (typeof slots === 'function') {
            slots(
              props => localId === this.guid && this.next(f(props)),
              this.props
            )
          } else {
            this.next(f(states[state]))
          }
        }
      }
    }
  }

  render() {
    const { props, oldProps, resolve, last } = this.state

    if (!props || Object.keys(props).length === 0) return null

    const {
      state,
      filter,
      states,
      primitive: Component,
      from: ownFrom,
      onRest,
      ...rest
    } = this.props

    const current = this.instance && this.instance.getValues()
    const from =
      typeof props.from === 'function'
        ? props.from
        : { ...oldProps.from, ...current, ...props.from }

    return (
      <Component
        ref={ref => (this.instance = ref)}
        {...rest}
        {...props}
        from={{ ...from, ...ownFrom }}
        onRest={args => {
          resolve(args)
          if (onRest && last) onRest(args)
        }}
      />
    )
  }
}

const Keyframes = React.forwardRef((props, ref) => (
  <KeyframesImpl {...props} forwardRef={ref} />
))

Keyframes.create = primitive => (states, filter = states => states) => {
  if (typeof states === 'function' || Array.isArray(states))
    states = { [DEFAULT]: states }
  return props => (
    <KeyframesImpl
      primitive={primitive}
      states={states}
      filter={filter}
      {...props}
    />
  )
}

Keyframes.interpolateTo = props => {
  const forward = getForwardProps(props)
  const rest = Object.keys(props).reduce(
    (acc, key) =>
      typeof forward[key] !== 'undefined' ? acc : { ...acc, [key]: props[key] },
    {}
  )
  return { to: forward, ...rest }
}

Keyframes.Spring = Keyframes.create(Spring)
Keyframes.Spring.to = states => Keyframes.Spring(states, interpolateTo)
Keyframes.Trail = Keyframes.create(Trail)
Keyframes.Trail.to = states => Keyframes.Trail(states, interpolateTo)

export default Keyframes
