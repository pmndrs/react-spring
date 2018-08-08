import 'antd/dist/antd.css'
import './styles.css'
import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { Keyframes, animated, config } from 'react-spring'
import { Avatar, Form, Icon, Input, Button, Checkbox } from 'antd'
import delay from 'delay'

const fast = {
  ...config.stiff,
  restSpeedThreshold: 1,
  restDisplacementThreshold: 0.01,
}

// Creates a spring with predefined animation slots
const Sidebar = Keyframes.Spring({
  // Slots can take arrays/chains,
  peek: [
    { delay: 500, from: { x: -100 }, to: { x: 0 }, config: fast },
    { delay: 800, to: { x: -100 }, config: config.slow },
  ],
  // single items,
  open: { to: { x: 0 }, config: config.default },
  // or async functions with side-effects
  close: async call => {
    await delay(400)
    await call({ to: { x: -100 }, config: config.gentle })
  },
})

// Creates a keyframed trail
const Content = Keyframes.Trail({
  peek: [
    { delay: 600, from: { x: -100, opacity: 0 }, to: { x: 0, opacity: 1 } },
    { to: { x: -100, opacity: 0 } },
  ],
  open: { delay: 100, to: { x: 0, opacity: 1 } },
  close: { to: { x: -100, opacity: 0 } },
})

const items = [
  <Avatar src="https://semantic-ui.com/images/avatar2/large/elyse.png" />,
  <Input
    size="small"
    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
    placeholder="Username"
  />,
  <Input
    size="small"
    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
    type="password"
    placeholder="Password"
  />,
  <Fragment>
    <Checkbox size="small">Remember me</Checkbox>
    <a className="login-form-forgot" href="#" children="Forgot password" />
    <Button
      size="small"
      type="primary"
      htmlType="submit"
      className="login-form-button"
      children="Log in"
    />
  </Fragment>,
]

export default class App extends React.Component {
  state = { open: undefined }
  toggle = () => this.setState(state => ({ open: !state.open }))
  render() {
    const state =
      this.state.open === undefined
        ? 'peek'
        : this.state.open
          ? 'open'
          : 'close'
    const icon = this.state.open ? 'fold' : 'unfold'
    return (
      <div style={{ background: 'lightblue', width: '100%', height: '100%' }}>
        <Icon type={`menu-${icon}`} className="toggle" onClick={this.toggle} />
        <Sidebar native state={state}>
          {({ x }) => (
            <animated.div
              className="sidebar"
              style={{
                transform: x.interpolate(x => `translate3d(${x}%,0,0)`),
              }}>
              <Content
                native
                keys={items.map((_, i) => i)}
                config={{ tension: 200, friction: 20 }}
                state={state}>
                {items.map((item, i) => ({ x, ...props }) => (
                  <animated.div
                    style={{
                      transform: x.interpolate(x => `translate3d(${x}%,0,0)`),
                      ...props,
                    }}>
                    <Form.Item className={i === 0 ? 'middle' : ''}>
                      {item}
                    </Form.Item>
                  </animated.div>
                ))}
              </Content>
            </animated.div>
          )}
        </Sidebar>
      </div>
    )
  }
}
