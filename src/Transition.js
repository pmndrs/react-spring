import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'
import Spring, { config } from './Spring'

const callOrRefer = (object, key) => (typeof object === 'function' ? object(key) : object)

export default class Transition extends React.PureComponent {
    static propTypes = {
        native: PropTypes.bool,
        config: PropTypes.object,
        from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        enter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        leave: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        keys: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object])),
            PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
        ]),
        accessor: PropTypes.func,
        children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
        render: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
    }

    static defaultProps = { from: {}, enter: {}, leave: {}, native: false, config: config.default, accessor: item => item }

    constructor(props) {
        super()
        let { children, render, keys, from, enter, leave, accessor } = props
        children = render || children
        if (!Array.isArray(children)) {
            children = [children]
            keys = keys ? [keys] : children
        }
        this.state = {
            transitionsKeys: keys,
            transitions: children.map((child, i) => ({
                children: child,
                key: keys[i],
                to: callOrRefer(enter, keys[i]),
                from: callOrRefer(from, keys[i]),
            })),
        }
    }

    componentWillReceiveProps(props) {
        let { transitions, transitionsKeys } = this.state
        let { children, render, keys, from, enter, leave, accessor } = props
        children = render || children
        if (!Array.isArray(children)) {
            children = [children]
            keys = keys ? [keys] : children
        }

        // Compare next keys with current keys
        let keysAccess = keys.map(key => accessor(key))
        let transitionKeysAccess = transitionsKeys.map(key => accessor(key))
        let nextSet = new Set(keysAccess)
        let currentSet = new Set(transitionKeysAccess)
        let added = keysAccess.filter(item => !currentSet.has(item))
        let deleted = transitionKeysAccess.filter(item => !nextSet.has(item))

        // Update child functions
        transitions = transitions.map(transition => {
            if (transition.destroy === undefined) {
                const index = keysAccess.indexOf(accessor(transition.key))
                const updatedChild = children[index]
                if (updatedChild) transition.children = updatedChild
            }
            return transition
        })

        // Add new children
        if (added.length) {
            added.forEach(key => {
                const index = keysAccess.indexOf(key)
                const child = children[index]
                const addedChild = {
                    children: child,
                    key: keys[index],
                    to: callOrRefer(enter, keys[index]),
                    from: callOrRefer(from, keys[index]),
                }
                transitions = [...transitions.slice(0, index), addedChild, ...transitions.slice(index)]
            })
        }

        // Remove old children
        if (deleted.length) {
            deleted.forEach(key => {
                const oldChild = transitions.find(child => accessor(child.key) === key)
                if (oldChild) {
                    const leavingChild = {
                        destroy: true,
                        children: oldChild.children,
                        key: oldChild.key,
                        to: callOrRefer(leave, oldChild.key),
                        from: callOrRefer(from, oldChild.key),
                        onRest: () => this.setState(state => ({ transitions: state.transitions.filter(child => child !== leavingChild) })),
                    }
                    transitions = transitions.map(child => (child === oldChild ? leavingChild : child))
                }
            })
        }

        // Update transition keys, remove leaving children
        transitionsKeys = transitions.filter(child => child.destroy === undefined).map(child => child.key)

        // Re-order list
        let ordered = keys.map(key => transitions.find(child => accessor(child.key) === accessor(key)))
        deleted.forEach(key => {
            let index = transitions.findIndex(child => accessor(child.key) === key)
            let child = transitions.find(child => accessor(child.key) === key)
            if (child) ordered = [...ordered.slice(0, index), child, ...ordered.slice(index)]
        })

        // Push new state
        this.setState({ transitions: ordered, transitionsKeys })
    }

    render() {
        const { render, from, enter, leave, native, config, keys, accessor, onUpdate, ...extra } = this.props
        const props = { native, config, ...extra }
        return this.state.transitions.map(({ key, children, ...rest }) => (
            <Spring
                key={accessor(key)}
                {...rest}
                {...props}
                onUpdate={onUpdate && (values => onUpdate(key, values))}
                render={render && children}
                children={render ? this.props.children : children}
            />
        ))
    }
}
