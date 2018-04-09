import React from 'react'
import PropTypes from 'prop-types'

export default class Keyframes extends React.Component {
    static propTypes = { script: PropTypes.func }
    state = { primitive: undefined, props: {}, resolve: () => null }
    componentDidMount() {
        if (this.props.script) this.props.script(this.next)
    }
    next = (primitive, props) => {
        return new Promise(resolve => {
            const current = this.instance && this.instance.getValues()
            const from = typeof props.from === 'function'  ? props.from : { ...this.state.props.from, ...current, ...props.from }
            this.setState(state => ({ primitive, props: { ...props, from }, resolve }))
        })
    }
    render() {
        const { primitive: Component, props, resolve } = this.state
        const { script, ...rest } = this.props
        return Component ? <Component ref={ref => (this.instance = ref)} {...rest} {...props} onRest={resolve} /> : null
    }
}
