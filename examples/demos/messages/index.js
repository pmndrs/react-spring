import React from 'react'
import { Transition, animated, config } from 'react-spring'
import lorem from 'lorem-ipsum'
import { X } from 'react-feather'
import { Main, Container, Message, Button, Content, Life } from './styles.js'

let id = 0
let spring = { ...config.default, precision: 0.1 }
let generateMsg = () => ({ key: id++, msg: lorem() })

export default class MessageHub extends React.PureComponent {
  state = { items: [] }
  cancelMap = new WeakMap()
  add = () =>
    this.setState(state => ({ items: [...state.items, generateMsg()] }))
  remove = item =>
    this.setState(state => ({
      items: state.items.filter(i => i.key !== item.key),
    }))
  config = (item, state) =>
    state === 'leave' ? [{ duration: 4000 }, spring, spring] : spring
  cancel = item => this.cancelMap.has(item) && this.cancelMap.get(item)()
  leave = item => async (next, cancel) => {
    this.cancelMap.set(item, cancel)
    await next({ life: '0%' })
    await next({ opacity: 0 })
    await next({ height: 0 }, true) // Inform Keyframes that is is the last frame
  }
  render() {
    return (
      <Main onClick={this.add}>
        Click here<br/>to create notifications
        <Container>
          <Transition
            native
            items={this.state.items}
            keys={item => item.key}
            from={{ opacity: 0, height: 0, life: '100%' }}
            enter={{ opacity: 1, height: 'auto' }}
            leave={this.leave}
            onRest={this.remove}
            config={this.config}>
            {item => ({ life, ...props }) => (
              <Message style={props}>
                <Content>
                  <Life style={{ right: life }} />
                  <p>{item.msg}</p>
                  <Button
                    onClick={e => {
                      e.stopPropagation()
                      this.cancelMap.has(item) && this.cancelMap.get(item)()
                    }}>
                    <X size={18} />
                  </Button>
                </Content>
              </Message>
            )}
          </Transition>
        </Container>
      </Main>
    )
  }
}
