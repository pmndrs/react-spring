import React from 'react'
import PropTypes from 'prop-types'
import Spring, { config as springConfig } from './Spring'

const empty = () => null
const ref = (object, key) =>
  typeof object === 'function' ? object(key) : object

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

  constructor(props) {
    super()
    let {
      children,
      render,
      keys,
      items,
      from = {},
      enter = {},
      leave = {},
      update,
    } = props
    children = render || children || empty
    if (typeof keys === 'function') keys = items.map(keys)
    if (!Array.isArray(children)) {
      children = [children]
      keys = keys ? [keys] : children
    }
    this.state = {
      transitionKeys: keys,
      transitions: children.map((child, i) => {
        const arg = items ? items[i] : keys[i]
        return {
          children: child,
          key: keys[i],
          item: arg,
          to: ref(enter, arg),
          from: ref(from, arg),
          update: ref(update, arg),
        }
      }),
    }
  }

  componentWillReceiveProps(props) {
    let { transitions, transitionKeys } = this.state
    let {
      children,
      render,
      keys,
      items,
      from = {},
      enter = {},
      leave = {},
      update,
    } = props

    children = render || children || empty
    if (typeof keys === 'function') keys = items.map(keys)
    if (!Array.isArray(children)) {
      children = [children]
      keys = keys ? [keys] : children
    }

    // Compare next keys with current keys
    let nextSet = new Set(keys)
    let currentSet = new Set(transitionKeys)
    let added = keys.filter(item => !currentSet.has(item))
    let deleted = transitionKeys.filter(item => !nextSet.has(item))
    let rest = keys.filter(item => currentSet.has(item))

    // Update child functions
    transitions = transitions.map(transition => {
      if (transition.destroy === undefined) {
        const index = keys.indexOf(transition.key)
        const updatedChild = children[index]
        if (updatedChild) transition.children = updatedChild
        if (update && rest.indexOf(transition.key) !== -1)
          transition.to =
            ref(update, items ? items[index] : keys[index]) || transition.to
      }
      return transition
    })

    // Add new children
    if (added.length) {
      added.forEach(key => {
        const index = keys.indexOf(key)
        const child = children[index]
        const arg = items ? items[index] : keys[index]
        const addedChild = {
          children: child,
          key: keys[index],
          item: arg,
          to: ref(enter, arg),
          from: ref(from, arg),
        }
        transitions = [
          ...transitions.slice(0, index),
          addedChild,
          ...transitions.slice(index),
        ]
      })
    }

    // Remove old children
    if (deleted.length) {
      deleted.forEach(key => {
        const oldChild = transitions.find(child => child.key === key)
        if (oldChild) {
          const leavingChild = {
            destroy: true,
            children: oldChild.children,
            key: oldChild.key,
            to: ref(leave, oldChild.item),
            from: ref(from, oldChild.item),
            onRest: () =>
              this.setState(state => ({
                transitions: state.transitions.filter(
                  child => child !== leavingChild
                ),
              })),
          }
          transitions = transitions.map(
            child => (child === oldChild ? leavingChild : child)
          )
        }
      })
    }

    // Update transition keys, remove leaving children
    transitionKeys = transitions
      .filter(child => child.destroy === undefined)
      .map(child => child.key)

    // Re-order list
    let ordered = keys.map(key => transitions.find(child => child.key === key))
    transitions.forEach((transition, index) => {
      if (transition.destroy && !ordered.find(t => t.key === transition.key))
        ordered = [
          ...ordered.slice(0, index),
          transition,
          ...ordered.slice(index),
        ]
    })

    // Push new state
    this.setState({ transitions: ordered, transitionKeys })
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
    return this.state.transitions.map(({ key, item, children, ...rest }, i) => (
      <Spring
        key={key}
        onRest={onRest && (values => onRest(item, values))}
        onFrame={onFrame && (values => onFrame(item, values))}
        {...rest}
        {...props}
        render={render && children}
        children={render ? this.props.children : children}
      />
    ))
  }
}
