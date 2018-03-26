import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'
import Spring, { config } from './Spring'

export default class Transition extends React.PureComponent {
        static propTypes = {
            native: PropTypes.bool,
            config: PropTypes.object,
            from: PropTypes.object,
            enter: PropTypes.object,
            leave: PropTypes.object,
            keys: PropTypes.oneOfType([
                PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
                PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            ]),
            children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
            render: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
        }

        static defaultProps = { from: {}, enter: {}, leave: {}, native: false, config: config.default }

        constructor(props) {
            super()
            let { children, render, keys, from, enter, leave } = props
            children = render || children
            if (!Array.isArray(children)) {
                children = [children]
                keys = keys ? [keys] : children
            }
            this.state = {
                transitionsKeys: keys,
                transitions: children.map((child, i) => ({ children: child, key: keys[i], to: enter, from })),
            }
        }

        componentWillReceiveProps(props) {
            let { transitions, transitionsKeys } = this.state
            let { children, render, keys, from, enter, leave } = props
            children = render || children
            if (!Array.isArray(children)) {
                children = [children]
                keys = keys ? [keys] : children
            }

            // Compare next keys with current keys
            let nextSet = new Set(keys)
            let currentSet = new Set(transitionsKeys)
            let added = keys.filter(item => !currentSet.has(item))
            let deleted = transitionsKeys.filter(item => !nextSet.has(item))

            // Update child functions
            transitions = transitions.map(transition => {
                if (transition.destroy === undefined) {
                    const index = keys.indexOf(transition.key)
                    const updatedChild = children[index]
                    if (updatedChild) transition.children = updatedChild
                }
                return transition
            })

            // Add new children
            if (added.length) {
                added.forEach(key => {
                    const index = keys.indexOf(key)
                    const addedChild = { children: children[index], key, to: enter, from }
                    transitions = [...transitions.slice(0, index), addedChild, ...transitions.slice(index)]
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
                            key,
                            to: leave,
                            from,
                            onRest: () =>
                                this.setState(state => ({
                                    transitions: state.transitions.filter(child => child !== leavingChild),
                                })),
                        }
                        transitions = transitions.map(child => (child === oldChild ? leavingChild : child))
                    }
                })
            }

            // Update transition keys, remove leaving children
            transitionsKeys = transitions.filter(child => child.destroy === undefined).map(child => child.key)

            // Re-order list
            let ordered = keys.map(key => transitions.find(child => child.key === key))
            deleted.forEach(key => {
                let index = transitions.findIndex(child => child.key === key)
                let child = transitions.find(child => child.key === key)
                if (child) ordered = [...ordered.slice(0, index), child, ...ordered.slice(index)]
            })

            // Push new state
            this.setState({ transitions: ordered, transitionsKeys })
        }

        render() {
            const { render, from, enter, leave, native, config, keys, ...extra } = this.props
            const props = { native, config, ...extra }
            return this.state.transitions.map(
                ({ key, children, ...rest }) =>
                    render ? (
                        <Spring key={key} {...rest} {...props} render={children} children={this.props.children} />
                    ) : (
                        <Spring key={key} {...rest} {...props} children={children} />
                    ),
            )
        }
    }