import React from 'react'
import { Transition, animated } from 'react-spring'

const defaultStyles = {
  overflow: 'hidden',
  width: '100%',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '2em',
  fontFamily: "'Kanit', sans-serif",
  textTransform: 'uppercase',
}

export default class TransitionsExample extends React.PureComponent {
  state = { items: [] }

  async componentDidMount() {
    this.t1 && clearTimeout(this.t1)
    this.t2 && clearTimeout(this.t2)
    this.t3 && clearTimeout(this.t3)

    this.setState({ items: ['Apples', 'Oranges', 'Bananas'] })
    this.t1 = setTimeout(
      () => this.setState({ items: ['Apples', 'Bananas'] }),
      1500
    )
    this.t2 = setTimeout(
      () => this.setState({ items: ['Apples', 'Oranges', 'Bananas'] }),
      3000
    )
    this.t3 = setTimeout(() => this.setState({ items: ['Kiwis'] }), 4500)
  }

  render() {
    return (
      <div
        style={{
          backgroundColor: '#70C1B3',
          overflow: 'hidden',
          cursor: 'pointer',
          margin: 0,
          padding: 0,
        }}
        onClick={() => this.componentDidMount()}>
        <Transition
          items={this.state.items}
          //initial={null}
          from={{ overflow: 'hidden', height: 0, opacity: 0 }}
          enter={{ height: 50, opacity: 1, background: '#28d79f' }}
          leave={{ height: 0, opacity: 0, background: '#c23369' }}
          update={{ background: '#28b4d7' }}
          trail={200}>
          {item => styles => (
            <animated.div style={{ ...defaultStyles, ...styles }}>
              {item}
            </animated.div>
          )}
        </Transition>
      </div>
    )
  }
}
