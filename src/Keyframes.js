import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import Trail from './Trail'
import Transition from './Transition'

const DEFAULT = '__default'

class Keyframes extends React.PureComponent {
  static propTypes = { state: PropTypes.string }
  static defaultProps = { state: DEFAULT }

  guid = 0
  state = { primitive: undefined, props: {}, oldProps: {}, resolve: () => null }

  componentDidMount() {
    this.componentDidUpdate({})
  }

  next = (primitive, props) => {
    return new Promise(resolve => {
      this.setState(state => ({
        primitive,
        props,
        oldProps: { ...this.state.props },
        resolve,
      }))
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.state !== this.props.state) {
      const { states, state, primitive } = this.props
      if (states && state && primitive) {
        const localId = ++this.guid
        const slots = states[state]
        if (slots) {
          if (Array.isArray(slots)) {
            let q = Promise.resolve()
            for (let s of slots) {
              q = q.then(() => localId === this.guid && this.next(primitive, s))
            }
          } else if (typeof slots === 'function') {
            slots(
              props => localId === this.guid && this.next(primitive, props),
              this.props
            )
          } else {
            this.next(primitive, states[state])
          }
        }
      }
    }
  }

  render() {
    const { primitive: Component, props, oldProps, resolve } = this.state
    const { from: ownFrom, onRest, ...rest } = this.props
    if (Component) {
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
            if (onRest) onRest(args)
          }}
        />
      )
    } else return null
  }

  static create = primitive => states => {
    if (typeof states === 'function' || Array.isArray(states))
      states = { [DEFAULT]: states }
    return props => (
      <Keyframes primitive={primitive} states={states} {...props} />
    )
  }
}

Keyframes.Spring = Keyframes.create(Spring)
Keyframes.Trail = Keyframes.create(Trail)
Keyframes.Transition = Keyframes.create(Transition)

export default Keyframes
