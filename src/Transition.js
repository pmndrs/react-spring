import React from 'react'
import PropTypes from 'prop-types'
import Spring from './Spring'
import Keyframes from './Keyframes'
import { config as springConfig } from './shared/constants'
import { callProp, toArray } from './shared/helpers'

const empty = () => null

const get = props => {
  let { items, keys, ...rest } = props
  items = toArray(items !== void 0 ? items : empty)
  keys = typeof keys === 'function' ? items.map(keys) : toArray(keys)
  // Make sure numeric keys are interpreted as Strings (5 !== "5")
  return { items, keys: keys.map(key => String(key)), ...rest }
}

let guid = 0

export default class Transition extends React.PureComponent {
  static propTypes = {
    /** First render base values (initial from -> enter), if present overrides "from", can be "null" to skip first mounting transition, or: item => values */
    initial: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Base values (from -> enter), or: item => values */
    from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Values that apply to new elements, or: fitem => values */
    enter: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
      PropTypes.func,
    ]),
    /** Values that apply to leaving elements, or: item => values */
    leave: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
      PropTypes.func,
    ]),
    /** Values that apply to elements that are neither entering nor leaving (you can use this to update present elements), or: item => values */
    update: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
      PropTypes.func,
    ]),
    /** Trailing delay in ms */
    trail: PropTypes.number,

    // TODO: Trailing oder, for instance: ['enter', 'leave', 'update']
    // order: PropTypes.arrayOf(PropTypes.string),

    /** Spring config, or for individual keys: fn((item,type) => config), where "type" can be either enter, leave or update */
    config: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** Calls back once a transition is about to wrap up */
    onDestroyed: PropTypes.func,
    /** Item keys (the same keys you'd hand over to react in a list). If you specify items, keys can be an accessor function (item => item.key) */
    keys: PropTypes.oneOfType([PropTypes.func, PropTypes.array, PropTypes.any]),
    /** An array of items to be displayed, use this if you need access to the actual items when distributing values as functions (see above) */
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.any]).isRequired,
    /** An array of functions (props => view) */
    children: PropTypes.func.isRequired,
  }

  static defaultProps = { keys: item => item }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  constructor(prevProps) {
    super(prevProps)
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
    const {
      items,
      keys,
      initial,
      from,
      enter,
      leave,
      update,
      trail = 0,
      config,
    } = get(props)
    const { keys: _keys, items: _items } = get(prevProps)
    const current = { ...state.current }
    const deleted = [...state.deleted]

    // Compare next keys with current keys
    let currentKeys = Object.keys(current)
    let currentSet = new Set(currentKeys)
    let nextSet = new Set(keys)
    let added = keys.filter(item => !currentSet.has(item))
    let removed = state.transitions
      .filter(item => !item.destroyed && !nextSet.has(item.originalKey))
      .map(i => i.originalKey)
    let updated = keys.filter(item => currentSet.has(item))
    let delay = 0

    added.forEach(key => {
      const keyIndex = keys.indexOf(key)
      const item = items[keyIndex]
      const state = 'enter'
      current[key] = {
        state,
        originalKey: key,
        key: guid++,
        item,
        trail: (delay = delay + trail),
        config: callProp(config, item, state),
        from: callProp(
          first ? (initial !== void 0 ? initial : from) : from,
          item
        ),
        to: callProp(enter, item),
      }
    })

    removed.forEach(key => {
      const keyIndex = _keys.indexOf(key)
      const item = _items[keyIndex]
      const state = 'leave'
      deleted.push({
        ...current[key],
        state,
        destroyed: true,
        left: _keys[Math.max(0, keyIndex - 1)],
        right: _keys[Math.min(_keys.length, keyIndex + 1)],
        trail: (delay = delay + trail),
        config: callProp(config, item, state),
        to: callProp(leave, item),
      })
      delete current[key]
    })

    updated.forEach(key => {
      const keyIndex = keys.indexOf(key)
      const item = items[keyIndex]
      const state = 'update'
      current[key] = {
        ...current[key],
        state,
        trail: (delay = delay + trail),
        config: callProp(config, item, state),
        to: callProp(update, item),
      }
    })

    // This tries to restore order for deleted items by finding their last known siblings
    let out = keys.map(key => current[key])
    deleted.forEach(({ left, right, ...transition }) => {
      let pos
      // Was it the element on the left, if yes, move there ...
      if ((pos = out.findIndex(t => t.originalKey === left)) !== -1) pos += 1
      // Or how about the element on the right ...
      if (pos === -1) pos = out.findIndex(t => t.originalKey === right)
      // Maybe we'll find it in the list of deleted items
      if (pos === -1) pos = deleted.findIndex(t => t.originalKey === left)
      // Checking right side as well
      if (pos === -1) pos = deleted.findIndex(t => t.originalKey === right)
      // And if nothing else helps, move it to the start ¯\_(ツ)_/¯
      pos = Math.max(0, pos)
      out = [...out.slice(0, pos), transition, ...out.slice(pos)]
    })

    return {
      first: first && added.length === 0,
      transitions: out,
      current,
      deleted,
      prevProps: props,
    }
  }

  getValues() {
    return undefined
  }

  destroyItem = (item, key, state) => values => {
    const { onRest, onDestroyed } = this.props
    if (this.mounted) {
      onDestroyed && onDestroyed(item)
      this.setState(
        ({ deleted }) => ({ deleted: deleted.filter(t => t.key !== key) }),
        () => delete this.springs[key]
      )
      onRest && onRest(item, state, values)
    }
  }

  render() {
    const {
      initial,
      from = {},
      enter = {},
      leave = {},
      update = {},
      onDestroyed,
      keys,
      items,
      onFrame,
      onRest,
      onStart,
      trail,
      config,
      children,
      ...extra
    } = this.props
    return this.state.transitions.map(
      ({ state, key, item, from, to, trail, config, destroyed }, i) => (
        <Keyframes
          primitive={Spring}
          state={state}
          filter={Keyframes.interpolateTo}
          states={{ [state]: to }}
          ref={r => r && (this.springs[key] = r.getValues())}
          key={key}
          onRest={
            destroyed
              ? this.destroyItem(item, key, state)
              : onRest && (values => onRest(item, state, values))
          }
          onStart={onStart && (() => onStart(item, state))}
          onFrame={onFrame && (values => onFrame(item, state, values))}
          delay={trail}
          config={config}
          {...extra}
          from={destroyed ? this.springs[key] || from : from}
          children={props => {
            const child = children(item, state, i)
            return child ? child(props) : null
          }}
        />
      )
    )
  }
}
