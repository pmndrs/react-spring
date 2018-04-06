import React from 'react'
import { Transition, animated } from 'react-spring'

const defaultStyles = {
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#FF1C68',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    fontSize: '4em',
}

export default class extends React.PureComponent {
    state = { items: [] }

    componentDidMount() {
        this.t1 && clearTimeout(this.t1)
        this.t2 && clearTimeout(this.t2)
        this.t3 && clearTimeout(this.t3)
        this.t4 && clearTimeout(this.t4)

        this.setState({ items: [] })
        // new item
        this.t1 = setTimeout(() => this.setState({ items: ['item1', 'item2', 'item3'] }), 1000)
        // new item in between
        this.t2 = setTimeout(() => this.setState({ items: ['item1', 'item2', 'item5', 'item3', 'item4'] }), 2000)
        // deleted items
        this.t3 = setTimeout(() => this.setState({ items: ['item1', 'item3', 'item4'] }), 3000)
        // scrambled order
        this.t4 = setTimeout(() => this.setState({ items: ['item4', 'item2', 'item3', 'item1'] }), 4000)
    }

    render() {
        return (
            <ul style={{ backgroundColor: '#70C1B3', overflow: 'hidden', cursor: 'pointer' }} onClick={() => this.componentDidMount()}>
                <Transition
                    native
                    keys={this.state.items}
                    from={{ opacity: 0, height: 0 }}
                    enter={{ opacity: 1, height: 100 }}
                    leave={{ opacity: 0, height: 0 }}>
                    {this.state.items.map(item => styles => <animated.li style={{ ...defaultStyles, ...styles }}>{item}</animated.li>)}
                </Transition>
            </ul>
        )
    }
}
