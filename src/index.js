import React from 'react'
import PropTypes from 'prop-types'
import uuid from 'tiny-uuid'
import Animated from './animated/targets/react-dom'

console.log(Animated)

function createAnimation(interpolator, defaultConfig) {
    return class extends React.PureComponent {
        static propTypes = {
            to: PropTypes.object,
            from: PropTypes.object,
            config: PropTypes.object,
            native: PropTypes.bool,
            onRest: PropTypes.func,
        }
        static defaultProps = { to: {}, from: {}, config: defaultConfig, native: false }

        constructor(props) {
            super()
            const { children, to, from, native } = props
            this._animation = new Animated.Value(0)
            this._updateInterpolations(props)
        }

        _callback = () => !this.props.native && this.forceUpdate()
        _attachProps(nextProps) {
            var oldPropsAnimated = this._propsAnimated 
            this._propsAnimated = new Animated.AnimatedProps(nextProps, this._callback) 
            oldPropsAnimated && oldPropsAnimated.__detach()
        }

        _mapValues(props, name, value, index) {
            const { from } = props
            const currentValue = this._animation._value
            let interpolate, overrideFrom
            if (Array.isArray(value)) {
                interpolate = value.map((array, i) => {
                    const [key, value] = Object.entries(array)[0]
                    const [fromValue] = (from && from[name] && from[name][i] && Object.values(from[name][i])) || [value]
                    const previousValue =
                        this._interpolations &&
                        this._interpolations[index] &&
                        Object.values(this._interpolations[index].interpolate[i])[0]._interpolation(currentValue)
                    return {
                        [key]: this._animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [previousValue !== undefined ? previousValue : fromValue, value],
                        }),
                    }
                })
            } else {
                const previous =
                    this._interpolations &&
                    this._interpolations[index] &&
                    this._interpolations[index].interpolate._interpolation(currentValue)
                const fromValue = previous !== undefined ? previous : from[name] !== undefined ? from[name] : value
                interpolate = this._animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [overrideFrom !== undefined ? overrideFrom : fromValue, value],
                })
            }
            return { name, interpolate }
        }

        _updateInterpolations = props => {
            const { from, to } = props
            this._interpolations = Object.entries({ ...from, ...to }).map(([n, v], i) =>
                this._mapValues(props, n, v, i),
            )
            this._to = this._interpolations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
            this._attachProps(this._to)
        }

        _updateAnimations = props => {
            const { to, from, config } = props
            this._updateInterpolations(props)
            this._animation.stopAnimation()
            this._animation.setValue(0)
            interpolator(this._animation, { toValue: 1, ...config }).start(this._onRest)
        }

        _onRest = props => {
            if (props.finished && this.props.onRest) this.props.onRest()
        }

        componentWillReceiveProps(props) {
            this._updateAnimations(props)
        }

        componentDidMount() {
            interpolator(this._animation, { toValue: 1, ...this.props.config }).start(this._onRest)
        }

        componentWillUnmount() {
            this._animation.stopAnimation()
        }

        render() {
            const { children, from, to, config, native, ...rest } = this.props
            let animatedProps = native ? this._to : this._propsAnimated.__getValue()
            return children({ ...animatedProps, ...rest })
        }
    }
}

function createTransition(interpolator, defaultConfig) {
    const Animation = createAnimation(interpolator, defaultConfig)
    return class TransitionSpring extends React.PureComponent {
        static propTypes = {
            from: PropTypes.object,
            enter: PropTypes.object,
            leave: PropTypes.object,
            keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
            native: PropTypes.bool,
        }

        constructor(props) {
            super()
            let { children, keys, from, enter, leave } = props
            if (!Array.isArray(children)) {
                children = [children]
                keys = [uuid()]
            }
            this.state = {
                transitionsKeys: keys,
                transitions: children.map((child, i) => ({ children: child, key: keys[i], to: enter, from })),
            }
        }

        componentWillReceiveProps(props) {
            let { transitions, transitionsKeys } = this.state
            let { native, children, keys, from, enter, leave } = props

            if (!Array.isArray(children)) {
                children = [children]
                keys = [props.children !== this.props.children ? uuid() : this.props.transitionsKeys[0]]
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
                    transition.children = children[index]
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
            return this.state.transitions.map(({ key, ...rest }) => <Animation {...rest} key={key} />)
        }
    }
}

const Spring = createAnimation(Animated.spring, { tension: 170, friction: 26 })
const SpringTransition = createTransition(Animated.spring, { tension: 170, friction: 26 })
const template = Animated.template
const animated = Animated.elements
export { createAnimation, createTransition, Spring, SpringTransition, template, animated }
