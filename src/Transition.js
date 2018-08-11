import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import { config as springConfig } from './targets/shared/constants'

const empty = () => null

const ref = (object, key, defaultValue) =>
  typeof object === 'function' ? object(key) : object || defaultValue

const get = props => {
  let { keys, children, render, items, ...rest } = props
  children = render || children || empty
  keys = typeof keys === 'function' ? items.map(keys) : keys
  if (!Array.isArray(children)) {
    children = [children]
    keys = keys !== void 0 ? [keys] : children.map(c => c.toString())
  }

  // Make sure numeric keys are interpreted as Strings (5 !== "5")
  keys = keys.map(k => String(k))

  return { keys, children, items, ...rest }
}

let guid = 0

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
    super(prevProps)
    this.springs = []
    this.state = { transitions: [], current: {}, deleted: [], prevProps }
  }

  static getDerivedStateFromProps(props, { prevProps, ...state }) {
    const { keys, children, items, from, enter, leave, update } = get(props)
    const { keys: _keys, items: _items } = get(prevProps)
    const current = { ...state.current }
    const deleted = [...state.deleted]

    // Compare next keys with current keys
    let currentKeys = Object.keys(current)
    let currentSet = new Set(currentKeys)
    let nextSet = new Set(keys)
    let added = keys.filter(item => !currentSet.has(item))
    let removed = currentKeys.filter(item => !nextSet.has(item))
    let updated = keys.filter(item => currentSet.has(item))

    added.forEach(key => {
      const keyIndex = keys.indexOf(key)
      const item = items ? items[keyIndex] : key
      current[key] = {
        children: children[keyIndex],
        key: guid++,
        item,
        to: ref(enter, item),
        from: ref(from, item),
      }
    })

    removed.forEach(key => {
      const keyIndex = _keys.indexOf(key)
      deleted.push({
        destroyed: true,
        lastIndex: keyIndex,
        ...current[key],
        to: ref(leave, _items ? _items[keyIndex] : key),
      })
      delete current[key]
    })

    updated.forEach(key => {
      const keyIndex = keys.indexOf(key)
      const item = items ? items[keyIndex] : key
      current[key] = {
        ...current[key],
        children: children[keyIndex],
        to: ref(update, item, current[key].to),
      }
    })

    let transitions = keys.map(key => current[key])
    deleted.forEach(
      ({ lastIndex: i, ...t }) =>
        (transitions = [...transitions.slice(0, i), t, ...transitions.slice(i)])
    )

    return { transitions, current, deleted, prevProps: props }
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
      keys,
      items,
      onFrame,
      onRest,
      ...extra
    } = this.props
    const props = { native, ...extra }
    return this.state.transitions.map((transition, i) => {
      const { key, item, children, from, ...rest } = transition
      return (
        <Spring
          ref={r => r && (this.springs[key] = r.getValues())}
          key={key}
          onRest={
            rest.destroyed
              ? () =>
                  this.setState(
                    ({ deleted }) => ({
                      deleted: deleted.filter(t => t.key !== key),
                    }),
                    () => delete this.springs[key]
                  )
              : onRest && (values => onRest(item, values))
          }
          onFrame={onFrame && (values => onFrame(item, values))}
          {...rest}
          {...props}
          from={rest.destroyed ? this.springs[key] || from : from}
          render={render && children}
          children={render ? this.props.children : children}
        />
      )
    })
  }
}
