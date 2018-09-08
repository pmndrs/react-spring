import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import { config as springConfig } from './targets/shared/constants'
import { callProp } from './targets/shared/helpers'

const empty = () => null

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
    /** First render base values (initial from -> enter), if present overrides "from", can be "null" to skip first mounting transition, or: item => values */
    initial: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Base values (from -> enter), or: item => values */
    from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Values that apply to new elements, or: fitem => values */
    enter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Values that apply to leaving elements, or: item => values */
    leave: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Values that apply to elements that are neither entering nor leaving (you can use this to update present elements), or: item => values */
    update: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Calls back once a transition is about to wrap up */
    onDestroyed: PropTypes.func,
    /** Item keys (the same keys you'd hand over to react in a list). If you specify items, keys can be an accessor function (item => item.key) */
    keys: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      ),
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ]),
    /** Optional: An array of items to be displayed, use this if you need access to the actual items when distributing values as functions (see above) */
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
    /** An array of functions (props => view), or a single function, or undefined */
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.node,
    ]),
    /** Same as children, but takes precedence if present */
    render: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
  }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  constructor(prevProps) {
    super(prevProps)
    // TODO: make springs a set
    this.springs = {}
    this.state = {
      first: true,
      transitions: [],
      current: {},
      deleted: [],
      prevProps,
    }
  }

  static getDerivedStateFromProps(props, { first, prevProps, ...state }) {
    const { keys, children, items, initial, from, enter, leave, update } = get(
      props
    )
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
        originalKey: key,
        children: children[keyIndex],
        key: guid++,
        item,
        from: {
          ...callProp(
            first ? (typeof initial !== 'undefined' ? initial : from) : from,
            item
          ),
        },
        to: callProp(enter, item),
      }
    })

    removed.forEach(key => {
      const keyIndex = _keys.indexOf(key)
      deleted.push({
        destroyed: true,
        lastSibling: _keys[Math.max(0, keyIndex - 1)],
        ...current[key],
        to: {
          ...current[key].to,
          ...callProp(leave, _items ? _items[keyIndex] : key),
        },
      })
      delete current[key]
    })

    updated.forEach(key => {
      const keyIndex = keys.indexOf(key)
      const item = items ? items[keyIndex] : key
      current[key] = {
        ...current[key],
        children: children[keyIndex],
        to: { ...current[key].to, ...callProp(update, item) },
      }
    })

    let transitions = keys.map(key => current[key])
    deleted.forEach(({ lastSibling: s, ...t }) => {
      // Find last known sibling, left aligned
      let i = Math.max(0, transitions.findIndex(t => t.originalKey === s) + 1)
      transitions = [...transitions.slice(0, i), t, ...transitions.slice(i)]
    })

    return {
      first: first && added.length === 0,
      transitions,
      current,
      deleted,
      prevProps: props,
    }
  }

  getValues() {
    return undefined
  }

  destroyItem = (item, key) => values => {
    const { onRest, onDestroyed } = this.props
    if (this.mounted) {
      onDestroyed && onDestroyed(item)
      this.setState(
        ({ deleted }) => ({ deleted: deleted.filter(t => t.key !== key) }),
        () => delete this.springs[key]
      )
      onRest && onRest(item, values)
    }
  }

  render() {
    const {
      render,
      initial,
      from = {},
      enter = {},
      leave = {},
      native = false,
      onDestroyed,
      keys,
      items,
      onFrame,
      onRest,
      ...extra
    } = this.props

    const props = { native, initial, ...extra }
    return this.state.transitions.map((transition, i) => {
      const { key, item, children, from, ...rest } = transition
      return (
        <Spring
          ref={r => r && (this.springs[key] = r.getValues())}
          key={key}
          onRest={
            rest.destroyed
              ? this.destroyItem(item, key)
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
