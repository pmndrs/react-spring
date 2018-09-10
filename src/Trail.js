import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import { config as springConfig } from './targets/shared/constants'

export default class Trail extends React.PureComponent {
  static propTypes = {
    /** Base values, optional */
    from: PropTypes.object,
    /** Animates to ... */
    to: PropTypes.object,
    /** Item keys (the same keys you'd hand over to react in a list). If you specify items, keys can be an accessor function (item => item.key) */
    keys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    /** An array of functions (props => view) */
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
    /** Same as children, but takes precedence if present */
    render: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
  }

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
      render,
      from = {},
      to = {},
      native = false,
      keys,
      delay,
      onRest,
      ...extra
    } = this.props
    const animations = new Set()
    const hook = (index, animation) => {
      animations.add(animation)
      if (index === 0) return undefined
      else return Array.from(animations)[index - 1]
    }
    const props = { ...extra, native, from, to }
    const target = render || children
    return target.map((child, i) => {
      const attachedHook = animation => hook(i, animation)
      const firstDelay = i === 0 && delay
      return (
        <Spring
          ref={ref => i === 0 && (this.instance = ref)}
          onRest={i === 0 ? onRest : null}
          key={keys[i]}
          {...props}
          delay={firstDelay || undefined}
          attach={attachedHook}
          render={render && child}
          children={render ? children : child}
        />
      )
    })
  }
}
