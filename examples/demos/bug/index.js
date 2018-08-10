import React from 'react'
import { Spring, animated, config } from 'react-spring'

const TreeNode = ({ classes, children, text, expanded }) => (
  <div>
    <div>{`${expanded ? '-' : '+'} ${text}`}</div>
    <Spring
      native
      from={{ height: 0 }}
      to={{ height: expanded ? 'auto' : 0 }}
      config={{
        ...config.stiff,
        restSpeedThreshold: 1,
        restDisplacementThreshold: 0.1,
      }}>
      {animatedStyle => (
        <animated.div
          style={{ ...animatedStyle, overflow: 'hidden', background: 'red' }}>
          {children}
        </animated.div>
      )}
    </Spring>
  </div>
)

export default class App extends React.Component {
  state = { root: false, child: false }
  toggleRoot = () => this.setState(prevState => ({ root: !prevState.root }))
  toggleChild = () => this.setState(prevState => ({ child: !prevState.child }))
  render() {
    return (
      <React.Fragment>
        <button onClick={this.toggleRoot}>Toggle root node</button>
        <button onClick={this.toggleChild}>Toggle first child</button>
        <div>
          <TreeNode expanded={this.state.root} text="root">
            <TreeNode expanded={this.state.child} text="child">
              HELLO
            </TreeNode>
          </TreeNode>
        </div>
      </React.Fragment>
    )
  }
}
