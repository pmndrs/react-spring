import ReactDOM from 'react-dom'
import React from 'react'
import { Transition, animated, config } from 'react-spring'
import lorem from 'lorem-ipsum'
import emoji from 'random-unicode-emoji'
import './styles.css'

let id = 0
let spring = { ...config.default, precision: 0.1 }
let generateMsg = () => ({
  key: id++,
  msg: lorem(),
  icn: emoji.random({ count: 1 }),
})

export default class MessageHub extends React.PureComponent {
  state = { items: [] }
  cancel = []
  add = () =>
    this.setState(state => ({ items: [...state.items, generateMsg()] }))
  remove = item =>
    this.setState(state => ({
      items: state.items.filter(i => i.key !== item.key),
    }))
  config = (item, state) =>
    state === 'leave' ? [{ duration: 4000 }, spring, spring] : spring
  leave = item => async (next, cancel) => {
    this.cancel[item.key] = cancel
    await next({ to: { life: 0 } })
    await next({ to: { opacity: 0 } })
    await next({ to: { height: 0 } }, true) // Inform Keyframes that is is the last frame
    delete this.cancel[item.key]
  }
  render() {
    return (
      <div className="main">
        <button onClick={this.add} children="add message" />
        <div className="container">
          <Transition
            native
            items={this.state.items}
            keys={item => item.key}
            from={{ opacity: 0, height: 0, life: 1 }}
            enter={{ opacity: 1, height: 'auto' }}
            leave={this.leave}
            onRest={this.remove}
            config={this.config}>
            {item => ({ life, ...props }) => (
              <animated.div style={props} className="msg">
                <div className="content">
                  <animated.div
                    style={{
                      right: life.interpolate(l => `calc(${l * 100}% + 10px)`),
                    }}
                    className="life"
                  />
                  <span>{item.icn}</span>
                  <p>{item.msg}</p>
                  <button
                    children="x"
                    onClick={() => this.cancel[item.key]()}
                  />
                </div>
              </animated.div>
            )}
          </Transition>
        </div>
      </div>
    )
  }
}
