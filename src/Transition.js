import React from 'react'
import PropTypes from 'prop-types'
import Spring, { config as springConfig } from './Spring'

const empty = () => null

const ref = (object = {}, key) =>
  typeof object === 'function' ? object(key) : object

const get = props => {
  let { keys, children, render, items, ...rest } = props
  children = render || children || empty
  keys = typeof keys === 'function' ? items.map(keys) : keys
  if (!Array.isArray(children)) {
    children = [children]
    keys = keys ? [keys] : children
  }
  return { keys, children, items, ...rest }
}

export default class Transition extends React.PureComponent {
  static propTypes = {
    native: PropTypes.bool,
    config: PropTypes.object,
    from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    enter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    leave: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    update: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    keys: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      ),
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ]),
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.object,
        ])
      ),
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
      ]),
    ]),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
    render: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
  }

  constructor(prevProps) {
    super()
    this.springs = []
    this.state = { transitions: [], prevProps }
  }

  static getDerivedStateFromProps(props, { transitions, prevProps }) {
    const { keys, children, items, from, enter, leave, update } = get(props)
    const { keys: _keys, children: _children, items: _items } = get(prevProps)

    // Compare next keys with current keys
    let allKeys = transitions.map(t => t.key)
    let nextSet = new Set(keys)
    let currentSet = new Set(allKeys)
    let added = keys.filter(item => !currentSet.has(item))
    let deleted = allKeys.filter(item => !nextSet.has(item))
    let rest = keys.filter(item => currentSet.has(item))

    // Insert new keys into the transition collection
    added.forEach(key => {
      const i = keys.indexOf(key)
      transitions = [...transitions.slice(0, i), key, ...transitions.slice(i)]
    })

    transitions = transitions.map(transition => {
      const isTransition = typeof transition === 'object'
      const key = isTransition ? transition.key : transition
      const keyIndex = keys.indexOf(key)
      const item = items ? items[keyIndex] : key
      if (isTransition) {
        // A transition already exists
        if (deleted.find(k => k === key)) {
          // The transition was removed, re-key it and animate it out
          return {
            ...transition,
            destroyed: true,
            prevKey: transition.key,
            key: transition.key + '_',
            to: !transition.destroyed
              ? ref(leave, _items ? _items[_keys.indexOf(key)] : key)
              : transition.to,
          }
        }
        // Transition remains untouched, update children and call hook
        return {
          ...transition,
          children: children[keyIndex] || transition.children,
          to:
            update && rest.indexOf(transition.key) !== -1
              ? ref(update, item) || transition.to
              : transition.to,
        }
      }
      // Map added key into transition
      return {
        children: children[keyIndex],
        key,
        item,
        to: ref(enter, item),
        from: ref(from, item),
      }
    })

    // Re-order list
    let ordered = keys.map(key => transitions.find(child => child.key === key))
    transitions.forEach((t, i) => {
      if (t.destroyed)
        ordered = [...ordered.slice(0, i), t, ...ordered.slice(i)]
    })

    return { transitions: ordered, prevProps: props }
  }

  getValues() {
    return undefined
  }

  render() {
    const {
      render,
      from = {},
      enter = {},
      leave = {},
      native = false,
      config = springConfig.default,
      keys,
      items,
      onFrame,
      onRest,
      ...extra
    } = this.props
    const props = { native, config, ...extra }
    return this.state.transitions.map((transition, i) => {
      const { prevKey, key, item, children, from, ...rest } = transition
      return (
        <Spring
          ref={r => (r ? (this.springs[key] = r) : delete this.springs[key])}
          key={key}
          onRest={
            rest.destroyed
              ? () =>
                  this.setState(s => ({
                    transitions: s.transitions.filter(t => t !== transition),
                  }))
              : onRest && (values => onRest(item, values))
          }
          onFrame={onFrame && (values => onFrame(item, values))}
          {...rest}
          {...props}
          from={rest.destroyed ? this.springs[prevKey].getValues() : from}
          render={render && children}
          children={render ? this.props.children : children}
        />
      )
    })
  }
}
