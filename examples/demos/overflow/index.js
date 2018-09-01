import React from 'react'
import { Transition, animated } from 'react-spring'

const defaultStyles = {
  width: '100%',
  backgroundColor: '#247BA0',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  fontSize: '4em',
}

export default class App extends React.PureComponent {
  state = { items: ['item1'] }

  toggleItem = () => {
    if (this.state.items.length > 0) this.setState({ items: [] })
    else this.setState({ items: ['item1'] })
  }
  render() {
    return (
      <div style={{ height: '100%' }} onClick={this.toggleItem}>
        <ul>
          <Transition
            native
            keys={this.state.items}
            from={{ opacity: 0, height: 0, overflow: 'hidden' }}
            enter={{ opacity: 1, height: 200, overflow: 'visible' }}
            leave={{ opacity: 0, height: 0, overflow: 'hidden' }}>
            {this.state.items.map(item => styles => (
              <animated.li style={{ ...defaultStyles, ...styles }}>
                <div style={{ height: 350, backgroundColor: 'red' }}>
                  {item}
                </div>
              </animated.li>
            ))}
          </Transition>
        </ul>
      </div>
    )
  }
}
