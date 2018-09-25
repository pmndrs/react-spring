import React from 'react'
import { Trail, Transition, animated, Globals } from 'react-spring'
import PropTypes from 'prop-types'

const wrap = (child, styles) => {
  styles = { willChange: Object.keys(styles).join(','), ...styles }
  if (!animated[child.type]) {
    // Wrap components into animated elements
    return <Globals.defaultElement style={{ ...styles }} children={child} />
  } else {
    // Otherwise inject styles into existing component-props
    const Component = animated[child.type]
    const props = {
      ...child.props,
      style: {
        ...child.props.style,
        ...styles,
      },
    }
    return <Component {...props} />
  }
}

// Wrapper around react-springs Trail component.
// It will make each child (which must be a dom node) fade and trail in.
export class Slug extends React.PureComponent {
  static propTypes = {
    from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  }
  render() {
    const {
      children,
      from = { opacity: 0, transform: 'translate3d(0,40px,0)' },
      to = { opacity: 1, transform: 'translate3d(0,0px,0)' },
      ...rest
    } = this.props
    const result = React.Children.map(children, child => styles =>
      wrap(child, styles)
    )
    return (
      <Trail
        native
        {...rest}
        keys={result.map((_, i) => i)}
        from={from}
        to={to}
        children={result}
      />
    )
  }
}

// Wrapper around react-springs Transition.
// It will Transition the child node in and out depending on the "show" prop.
export class Fade extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    show: PropTypes.bool,
    from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    enter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    leave: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  }
  render() {
    const {
      children,
      show = true,
      from = { opacity: 0 },
      enter = { opacity: 1 },
      leave = { opacity: 0 },
      ...rest
    } = this.props
    const result = styles => wrap(children, styles)
    return (
      <Transition
        native
        keys={show.toString()}
        {...rest}
        from={from}
        enter={enter}
        leave={leave}
        children={show ? result : undefined}
      />
    )
  }
}
