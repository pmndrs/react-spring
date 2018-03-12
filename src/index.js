import React from 'react'
import PropTypes from 'prop-types'
import Animated from './animated/targets/react-dom'

const config = {
    default: { tension: 170, friction: 26 },
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
}

export function createAnimation(interpolator, defaultConfig) {
    return class extends React.PureComponent {
        static propTypes = {
            to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
            from: PropTypes.object,
            config: PropTypes.object,
            native: PropTypes.bool,
            onRest: PropTypes.func,
            children: PropTypes.func,
            render: PropTypes.func,
            immediate: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),
        }
        static defaultProps = { from: {}, to: {}, config: defaultConfig, native: false, immediate: false }

        constructor(props) {
            super()
            this.defaultAnimation = new Animated.Value(0)
            this.animations = {}
            this.update(props, false)
        }

        update({ from, to, config, attach, immediate }, start = false) {
            const allProps = Object.entries({ ...from, ...to })
            const defaultAnimationValue = this.defaultAnimation._value

            this.interpolators = {}
            this.defaultAnimation.setValue(0)
            this.animations = allProps.reduce((acc, [name, value], i) => {
                const entry = this.animations[name] || (this.animations[name] = {})

                let isNumber = typeof value === 'number'
                let fromValue = from[name] !== undefined ? from[name] : value
                let toValue = isNumber ? value : 1

                if (isNumber && attach) {
                    // Attach value to target animation
                    const target = attach(this)
                    const targetAnimation = target && target.animations[name]
                    if (targetAnimation) toValue = targetAnimation.animation
                }

                if (isNumber) {
                    // Create animated value
                    entry.animation = entry.interpolation = entry.animation || new Animated.Value(fromValue)
                } else {
                    // Deal with interpolations
                    const previous = entry.interpolation && entry.interpolation._interpolation(defaultAnimationValue)
                    entry.animation = this.defaultAnimation
                    entry.interpolation = this.defaultAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [previous !== undefined ? previous : fromValue, value],
                    })
                }

                if (immediate && (immediate === true || immediate.indexOf(name) !== -1))
                    entry.animation.setValue(toValue)
                entry.start = () => interpolator(entry.animation, { toValue, ...config }).start(i === 0 && this.onRest)
                entry.stop = () => entry.animation.stopAnimation()
                start && entry.start()

                this.interpolators[name] = entry.interpolation
                return { ...acc, [name]: entry }
            }, {})

            var oldPropsAnimated = this.propsAnimated
            this.propsAnimated = new Animated.AnimatedProps(this.interpolators, this.callback)
            oldPropsAnimated && oldPropsAnimated.__detach()
        }

        callback = () => !this.props.native && this.forceUpdate()
        onRest = props => props.finished && this.props.onRest && this.props.onRest()

        componentWillReceiveProps(props) {
            this.update(props, true)
        }

        componentDidMount() {
            Object.values(this.animations).forEach(({ start }) => start())
        }

        componentWillUnmount() {
            Object.values(this.animations).forEach(({ stop }) => stop())
        }

        render() {
            const { children, render, from, to, config, native, ...extra } = this.props
            let animatedProps = native ? this.interpolators : this.propsAnimated.__getValue()
            return render ? render({ ...animatedProps, ...extra, children }) : children({ ...animatedProps, ...extra })
        }
    }
}

export function createTransition(interpolator, defaultConfig) {
    const Animation = createAnimation(interpolator, defaultConfig)
    return class extends React.PureComponent {
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

        static defaultProps = { from: {}, enter: {}, leave: {}, native: false, config: defaultConfig }

        constructor(props) {
            super()
            let { children, render, keys, from, enter, leave } = props
            children = render || children
            if (!Array.isArray(children)) children = [children]
            if (!Array.isArray(keys)) keys = [keys]
            this.state = {
                transitionsKeys: keys,
                transitions: children.map((child, i) => ({ children: child, key: keys[i], to: enter, from })),
            }
        }

        componentWillReceiveProps(props) {
            let { transitions, transitionsKeys } = this.state
            let { children, render, keys, from, enter, leave } = props
            children = render || children
            if (!Array.isArray(children)) children = [children]
            if (!Array.isArray(keys)) keys = [keys]

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
            return this.state.transitions.map(({ key, children, ...rest }) =>
                render
                    ? <Animation key={key} {...rest} {...props} render={children} children={this.props.children} />
                    : <Animation key={key} {...rest} {...props} children={children} />
            )
        }
    }
}

export function createTrail(interpolator, defaultConfig) {
    const Animation = createAnimation(interpolator, defaultConfig)
    return class extends React.PureComponent {
        static propTypes = {
            native: PropTypes.bool,
            config: PropTypes.object,
            from: PropTypes.object,
            to: PropTypes.object,
            keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
            children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
            render: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
        }
        static defaultProps = { from: {}, to: {}, native: false, config: defaultConfig }
        render() {
            const { children, render, from, to, native, config, keys, ...extra } = this.props
            const animations = new Set()
            const hook = (index, animation) => {
                animations.add(animation)
                if (index === 0) return undefined
                else return Array.from(animations)[index - 1]
            }
            const props = { ...extra, native, config, from, to }
            return (render || children).map((child, i) => {
                const attachedHook = animation => hook(i, animation)
                return render
                    ? <Animation key={keys[i]} {...props} attach={attachedHook} render={child} children={children} />
                    : <Animation key={keys[i]} {...props} attach={attachedHook} children={child} />
            })
        }
    }
}

const Spring = createAnimation(Animated.spring, config.default)
const SpringTransition = createTransition(Animated.spring, config.default)
const SpringTrail = createTrail(Animated.spring, config.default)
const template = Animated.template
const animated = Animated.elements
export { Spring, SpringTransition, SpringTrail, config, template, animated }
