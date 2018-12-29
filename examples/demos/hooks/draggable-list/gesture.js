import React from 'react'
import PropTypes from 'prop-types'

const initialState = {
  target: undefined,
  args: undefined,
  x: 0,
  y: 0,
  xDelta: 0,
  yDelta: 0,
  xInitial: 0,
  yInitial: 0,
  xPrev: 0,
  yPrev: 0,
  xVelocity: 0,
  yVelocity: 0,
  down: false,
}

function handlers(set, props = {}, args) {
  // Common handlers
  const handleUp = () =>
    set(state => {
      const newProps = { ...state, target: undefined, down: false }
      props.onAction && props.onAction(newProps)
      return newProps
    })
  const handleDown = ({ target, pageX, pageY }) =>
    set(state => {
      const newProps = {
        ...state,
        target,
        args,
        x: pageX,
        y: pageY,
        xDelta: 0,
        yDelta: 0,
        xVelocity: 0,
        yVelocity: 0,
        xInitial: pageX,
        yInitial: pageY,
        xPrev: pageX,
        yPrev: pageY,
        down: true,
      }
      props.onAction && props.onAction(newProps)
      return newProps
    })
  const handleMove = ({ pageX, pageY, movementX, movementY }) =>
    set(state => {
      const newProps = {
        ...state,
        x: pageX,
        y: pageY,
        xDelta: pageX - state.xInitial,
        yDelta: pageY - state.yInitial,
        xPrev: state.x,
        yPrev: state.y,
        xVelocity: movementX,
        yVelocity: movementY,
      }
      props.onAction && props.onAction(newProps)
      return newProps
    })

  // Touch handlers
  const handleTouchStart = e => {
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
    handleDown(e.touches[0])
  }
  const handleTouchMove = e => handleMove(e.touches[0])
  const handleTouchEnd = () => {
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleMouseUp)
    handleUp()
  }

  // Mouse handlers
  const handleMouseDown = e => {
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleMouseUp)
    handleDown(e)
  }
  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMove)
    window.removeEventListener('mouseup', handleMouseUp)
    handleUp()
  }
  return {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
  }
}

const withGesture = Wrapped =>
  class extends React.Component {
    static propTypes = {
      /** When this holds true it will manage its state outside of React, in this case it will never ever
       cause a new render, clients have to rely on callbacks to get notified (onUp/Down/Move). */
      transient: PropTypes.bool,
      /** Optional. Calls back on mouse or touch down/up/move */
      onAction: PropTypes.func,
    }
    static defaultProps = { touch: true, mouse: true }

    constructor(props) {
      super(props)
      this.state = initialState
      let set = this.setState.bind(this)
      if (props.transient) {
        this._state = initialState
        set = cb => (this._state = cb(this._state))
      }
      this.handlers = handlers(set, props)
    }

    render() {
      const { style, className, ...props } = this.props
      return (
        <div
          {...this.handlers}
          style={{ display: 'contents', ...style }}
          className={className}>
          <Wrapped {...props} {...this.state} />
        </div>
      )
    }
  }

const Gesture = withGesture(
  class extends React.PureComponent {
    render() {
      return this.props.children(this.props)
    }
  }
)

function useGesture(props) {
  const [state, set] = React.useState(initialState)
  const transientState = React.useRef(initialState)
  if (typeof props === 'function') props = { transient: true, onAction: props }
  const [spread] = React.useState(() => (...args) =>
    handlers(
      props && props.transient
        ? cb => (transientState.current = cb(transientState.current))
        : set,
      props,
      args
    )
  )
  return props && props.transient ? spread : [spread, state]
}

export { withGesture, Gesture, useGesture }
