    npm install react-spring

Demo: https://codesandbox.io/embed/oln44nx8xq

Proof of concept, for now. Trying to bridge react-motion and animated. React-motion is great, but doesn't interpolate well, non-binary (0 -> 1) animations [get very hard to do](https://github.com/chenglou/react-motion/issues/526) as it can't deal with colors, gradients, paths, etc. Animated is awesome and it can interpolate everything, but the downside is manually having to manage animation-handles, doing the stopping/cleaning chores.

So, this lib has more or less the same api as react-motion (Spring -> Motion, from -> defaultStyles, to -> styles) while you can feed it everything animated can take in (which is used underneath). 

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import Spring from 'react-spring'

const Content = ({ toggle, number, scale, path, gradientStart, gradientEnd, ...style }) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(to bottom, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        }}>
        <svg
            onClick={toggle}
            style={{
                width: 300,
                height: 300,
                ...style,
                tranformOrigin: 'center center',
                transform: `scale(${scale})`,
            }}
            version="1.1"
            viewBox="0 0 400 400"
            className="header-triangle">
            <g className="path" fill={style.color} fillRule="evenodd">
                <path id="path-1" d={path} />
            </g>
            <text fontSize="2em" textAnchor="middle" x="50%" y="50%" fill="#FFFFFF">
                <tspan x="50%" dy="1em" textAnchor="middle">
                    Click me ...
                </tspan>
            </text>
        </svg>
    </div>
)

const TRIANGLE = 'M20,380 L380,380 L380,380 L200,20 L20,380 Z'
const RECTANGLE = 'M20,20 L20,380 L380,380 L380,20 L20,20 Z'

class App extends React.Component {
    state = { toggle: true }
    toggle = () => this.setState(state => ({ toggle: !state.toggle }))
    render() {
        const toggle = this.state.toggle
        const color = toggle ? '#c23369' : '#28d79f'
        return (
            <Spring
                from={{ opacity: 0 }}
                to={{
                    color,
                    opacity: 1,
                    gradientStart: toggle ? color : 'black',
                    gradientEnd: toggle ? 'black' : color,
                    number: toggle ? 100 : 0,
                    scale: toggle ? 1 : 2,
                    path: toggle ? TRIANGLE : RECTANGLE,
                }}
                children={Content} // Render prop
                toggle={this.toggle} // Additional props will be spread over the child
            />
        )
    }
}

render(<App />, document.getElementById('root'))
```
