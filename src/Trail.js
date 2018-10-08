import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import { config as springConfig } from './shared/constants'
import { toArray } from './shared/helpers'

export default class Trail extends React.PureComponent {
  static propTypes = {
    /** Base values, optional */
    from: PropTypes.object,
    /** Animates to ... */
    to: PropTypes.object,
    /** Item keys (the same keys you'd hand over to react in a list). If you specify items, keys can be an accessor function (item => item.key) */
    keys: PropTypes.oneOfType([PropTypes.func, PropTypes.array, PropTypes.any]),
    /** An array of items to be displayed, use this if you need access to the actual items when distributing values as functions (see above) */
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.any]).isRequired,
    /** An array of functions (props => view) */
    children: PropTypes.func.isRequired,
  }

  static defaultProps = { keys: item => item }

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
      items,
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
    return toArray(items).map((item, i) => {
      const attachedHook = animation => hook(i, animation)
      const firstDelay = i === 0 && delay
      return (
        <Spring
          ref={ref => i === 0 && (this.instance = ref)}
          onRest={i === 0 ? onRest : null}
          key={typeof keys === 'function' ? keys(item) : toArray(keys)[i]}
          {...props}
          delay={firstDelay || undefined}
          attach={attachedHook}
          children={props => {
            const child = children(item, i)
            return child ? child(props) : null
          }}
        />
      )
    })
  }
}
