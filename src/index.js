import React from 'react'
import PropTypes from 'prop-types'
import animated from './animated/index'

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
            this._animation = new animated.Value(0)
            this._original = children
            this._component = native ? children : animated.createAnimatedComponent(children)
            this._updateInterpolations(props)
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
            this._interpolations = Object.entries({ ...from, ...to }).map(([n, v], i) => this._mapValues(props, n, v, i))
            this._to = this._interpolations.reduce((acc, anim) => ({ ...acc, [anim.name]: anim.interpolate }), {})
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
            if (props.children !== this._original) {
                // So, this is probably the weirdest issue that has to be dealt with.
                // Twitter advocates render props, but in a way that re-calls the anonomous child function
                // on every render. Since Animated wraps it into an animatedComponent it needs to be updated
                // or else it would freeze forever and become stale. This following check at least tries to benefit
                // those that don't re-create their child on every render, the rest will get mounts and unmounts.
                this._original = props.children
                this._component = props.native ? props.children : animated.createAnimatedComponent(props.children)
            }
            this._updateAnimations(props)
        }

        componentDidMount() {
            interpolator(this._animation, { toValue: 1, ...this.props.config }).start(this._onRest)
        }

        componentWillUnmount() {
            this._animation.stopAnimation()
        }

        render() {
            const { from, to, config, native, ...rest } = this.props
            return React.createElement(this._component, { ...this._to, ...rest })
        }
    }
}

function arrayDiff(next = [], current = []) {
    let nextSet = new Set(next)
    let currentSet = new Set(current)
    let added = next.filter(item => !currentSet.has(item))
    let deleted = current.filter(item => !nextSet.has(item))
    return { added, deleted }
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
            const { children, keys, from, enter, leave } = props
            this.state = {
                transitions: children.map((child, i) => this._wrapTransition(child, keys[i], props)),
            }
        }

        _wrapTransition(child, key, props) {
            const { from, enter, native } = props
            return <Animation native={native} from={from} to={enter} key={key} children={child} />
        }

        componentWillReceiveProps(props) {
            let { transitions } = this.state
            const { children, keys, from, enter, leave } = props
            const { added, deleted } = arrayDiff(keys, transitions.map(child => child.key))

            if (added) {
                added.forEach(key => {
                    const index = keys.indexOf(key)
                    const wrappedChild = this._wrapTransition(children[index], key, props)
                    transitions = [...transitions.slice(0, index), wrappedChild, ...transitions.slice(index)]
                })
            }

            if (deleted) {
                deleted.forEach(key => {
                    const deletedChild = transitions.find(child => child.key === key)

                    if (deletedChild) {
                        const wrappedChild = React.cloneElement(deletedChild, {
                            to: leave,
                            onRest: () =>
                                this.setState(state => ({
                                    transitions: state.transitions.filter(child => child.key !== key),
                                })),
                        })
                        transitions = transitions.map(child => (child === deletedChild ? wrappedChild : child))
                    }
                })
            }

            let ordered = keys.map(key => transitions.find(child => child.key === key))
            deleted.forEach(key => {
                let index = transitions.findIndex(child => child.key === key)
                let child = transitions.find(child => child.key === key)
                ordered = [...ordered.slice(0, index), child, ...ordered.slice(index)]
            })

            this.setState({ transitions: ordered })
        }

        render() {
            return this.state.transitions
        }
    }
}

const Spring = createAnimation(animated.spring, { tension: 170, friction: 26 })
const SpringTransition = createTransition(animated.spring, { tension: 170, friction: 26 })
export { createAnimation, createTransition, Spring, SpringTransition, animated }
