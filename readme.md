    npm install react-spring

Demo: https://codesandbox.io/embed/oln44nx8xq

Proof of concept, for now. Trying to bridge react-motion and animated. React-motion is great, but doesn't interpolate well, non-binary (as in shifting from one state to another instead of toggling between 0 and 1) [get very hard to do](https://github.com/chenglou/react-motion/issues/526) as it can't deal with colors, gradients, paths, etc. Animated is awesome and it can interpolate everything, but the downside is manually having to manage animation-handles, doing the stopping/cleaning chores.

So, this lib has more or less the same api as react-motion (Spring -> Motion, from -> defaultStyles, to -> styles) while you can feed it everything animated can take in (which is used underneath).

```jsx
import { Spring } from 'react-spring'

const TRIANGLE = 'M20,380 L380,380 L380,380 L200,20 L20,380 Z'
const RECTANGLE = 'M20,20 L20,380 L380,380 L380,20 L20,20 Z'
const RED = '#c23369'
const GREEN = '#28d79f'

const Content = ({ toggle, color, opacity, scale, path, start, stop, end }) => (
    <div style={{ background: `linear-gradient(to bottom, ${start} ${stop}, ${end} 100%)` }}>
        <svg
            onClick={toggle}
            style={{ opacity, transform: `scale3d(${scale}, ${scale}, ${scale})` }}
            version="1.1"
            viewBox="0 0 400 400">
            <g fill={color} fillRule="evenodd">
                <path id="path-1" d={path} />
            </g>
        </svg>
    </div>
)

class App extends React.Component {
    state = { toggle: true }
    toggle = () => this.setState(state => ({ toggle: !state.toggle }))
    render() {
        const toggle = this.state.toggle
        return (
            <Spring
                // Default values, optional ...
                from={{ opacity: 0 }}
                // Will animate to ...
                to={{
                    // Can be numbers, colors, paths, degrees, percentages, ...
                    opacity: 1,
                    color: toggle ? RED : GREEN,
                    start: toggle ? RED : 'black',
                    end: toggle ? 'black' : GREEN,
                    stop: toggle ? '0%' : '50%',
                    scale: toggle ? 1 : 2,
                    path: toggle ? TRIANGLE : RECTANGLE,
                }}
                // You can finetune spring settings
                config={{ friction: 1, tension: 10 }}
                // All additional props will be spread over the child
                toggle={this.toggle}
                // Child as function/render-prop, receives interpolated values
                children={Content}
            />
        )
    }
}
```

### Native rendering

React-spring will re-render the receiving component on every frame. It is usually fine and gives you more freedom to animate whatever you like. If you need more performance supply the `native` flag. Now your component will only render once and all updates will efficiently be applied to it outside of Reacts render loop.

This has a few gotchas:

1.  You can only animate styles!
2.  The components that receive your styles have to be special, animated components. The styles are opaque objects, not regular styles!
3. If you use transforms, make sure it's an array

```jsx
import { Spring, animated } from 'react-spring'

class App extends React.Component {
    state = { toggle: true }
    toggle = () => this.setState(state => ({ toggle: !state.toggle }))
    render() {
        const toggle = this.state.toggle
        return (
            <Spring
                native
                from={{ color: 'white', opacity: 0, transform: [{ scale: 0 }] }}
                to={{ color: 'red', opacity: 1, transform: [{ scale: this.state.toggle ? 2 : 1 }] }}>
                {style => (
                    <animated.div style={{ ...style, transformOrigin: 'left' }}>
                        {this.state.toggle ? 'open' : 'closed'}
                    </animated.div>
                )}
            </Spring>
        )
    }
}
```

By default you can use `animated.div`, `animated.span` and `animated.img`, you can create your own by calling: `animated.createAnimatedComponent('h1')` or whatever element you need.


