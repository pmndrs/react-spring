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
        const color = toggle ? RED : GREEN
        return (
            <Spring
                // Default values, optional ...
                from={{ opacity: 0 }}
                // Will animate to ...
                to={{
                    // Can be numbers, colors, paths, patterns, percentages ...
                    color,
                    opacity: 1,
                    start: toggle ? color : 'black',
                    stop: toggle ? '0%' : '50%',
                    end: toggle ? 'black' : color,
                    scale: toggle ? 1 : 2,
                    path: toggle ? TRIANGLE : RECTANGLE,
                }}
                // Content is rendered by prop
                children={Content}
                // You can finetune spring settings
                config={{ friction: 1, tension: 10 }}
                // All additional props will be spread over the child
                toggle={this.toggle}
            />
        )
    }
}
```
