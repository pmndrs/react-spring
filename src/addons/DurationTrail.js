import React from 'react'
import { Spring } from 'react-spring'

export default class DurationTrail extends React.Component {
  getValues() {
    return this.instance && this.instance.getValues()
  }

  componentDidMount() {
    this.instance && this.instance.flush()
  }

  componentDidUpdate() {
    this.instance && this.instance.flush()
  }

  render() {
    const {
      children,
      delay = 0,
      ms = 200,
      reverse = false,
      keys,
      onRest,
      ...props
    } = this.props
    return children.map((child, i) => (
      <Spring
        ref={ref => i === 0 && (this.instance = ref)}
        key={keys[i]}
        {...props}
        delay={delay + (reverse ? children.length - i : i) * ms}
        onRest={i === (reverse ? 0 : children.length - 1) ? onRest : null}
        children={child}
      />
    ))
  }
}
