import React from 'react'
import ReactDOM from 'react-dom'
import { Spring, Keyframes, animated, config } from 'react-spring'
import { Transition, TransitionGroup } from 'react-transition-group'

const defaultStyles = {
  overflow: 'hidden',
  width: '100%',
  backgroundColor: '#247BA0',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  fontSize: '4em',
}

const Anim = Keyframes.Spring({
  entered: { to: { opacity: 1, height: 'auto' } },
  exiting: [{ to: { opacity: 0 } }, { to: { height: 0 } }],
})

export default class App extends React.PureComponent {
  state = { items: ['item1', 'item2', 'item3'], test: { color: 'yellow' } }

  componentDidMount() {
    setTimeout(
      () =>
        this.setState({ items: ['item1', 'item3'], test: { fontSize: '3em' } }),
      1000
    )
  }

  render() {
    console.log(this.state.items)
    return (
      <ul>
        <TransitionGroup>
          {this.state.items.map(item => (
            <Transition key={item} timeout={{ enter: 0, exit: 2000 }}>
              {state =>
                console.log(item, state) || (
                  <Anim
                    native
                    from={{ overflow: 'hidden', opacity: 0, height: 0 }}
                    state={state}>
                    {props => <animated.div style={props}>{item}</animated.div>}
                  </Anim>
                )
              }
            </Transition>
          ))}
        </TransitionGroup>
        <Spring
          from={{ background: 'black', color: 'white', fontSize: '1em' }}
          to={this.state.test}>
          {props => <li style={props}>hello</li>}
        </Spring>
      </ul>
    )
  }
}
