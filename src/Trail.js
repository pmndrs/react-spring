import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import { config as springConfig } from './shared/constants'
import { toArray } from './shared/helpers'

export default class Trail extends React.PureComponent {
  static propTypes = {
    /** Item keys (the same keys you'd hand over to react in a list). If you specify items, keys can be an accessor function (item => item.key) */
    keys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ).isRequired,
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
    /** When true the trailing order is switched, it will then trail bottom to top */
    reverse: PropTypes.bool,
  }

  static defaultProps = { keys: item => item }

  first = true
  instances = new Set()
  hook = (instance, index, length, reverse) => {
    // Add instance to set
    this.instances.add(instance)
    // Return undefined on the first index and from then on the previous instance
    if (reverse ? index === length - 1 : index === 0) return undefined
    else return Array.from(this.instances)[reverse ? index + 1 : index - 1]
  }

  render() {
    const {
      items,
      children,
      render,
      from = {},
      initial,
      to = {},
      native,
      reverse,
      keys,
      delay,
      onRest,
      ...extra
    } = this.props

    const props = { ...extra, native, to }
    const array = toArray(items)
    return toArray(array).map((item, i) => (
      <Spring
        onRest={i === 0 ? onRest : null}
        key={typeof keys === 'function' ? keys(item) : toArray(keys)[i]}
        from={this.first && initial !== void 0 ? initial || {} : from}
        {...props}
        delay={(i === 0 && delay) || undefined}
        attach={instance => this.hook(instance, i, array.length, reverse)}
        children={props => {
          const child = children(item, i)
          return child ? child(props) : null
        }}
      />
    ))
  }

  componentDidUpdate(prevProps) {
    this.first = false
    if (prevProps.items !== this.props.items) this.instances.clear()
  }
}
