    npm install react-spring

Demo: https://codesandbox.io/embed/oln44nx8xq

React-spring is a wrapper around a cooked down fork of [Facebooks animated](http://animatedjs.github.io/interactive-docs/). It is trying to bridge Chenglou's [React-motion](https://github.com/chenglou/react-motion) and animated as both have their pros and cons, but definitively could benefit from one another:

React-motion

- [x] Declarative api that doesn't involve manual cleaning and stopping on handles
- [ ] Performance suffers because components are re-rendered on every frame
- [ ] It is best used for toggle animations but can't transition between raw state as it doesn't know colors, paths, gradients, etc. 

Animates

- [x] Very powerful, lots of features
- [x] Very efficient, it changes styles outside of Reacts render loop
- [ ] Managing and orchestrating handles becomes a chore

This lib inherits react-motions api (Spring -> Motion, from -> defaultStyles, to -> styles) while you can feed it everything animated can take in as well as allowing for native animations.

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

Demo: https://codesandbox.io/embed/882njxpz29

React-spring will re-render the receiving component on every frame. It is usually fine and gives you more freedom to animate whatever you like. If you need more performance supply the `native` flag. Now your component will only render once and all updates will efficiently be applied to it outside of Reacts render loop.

This has a few gotchas:

1. You can only animate styles!
2. If you use transforms, make sure it's an array
3. The components that receive your styles have to be special, animated components. The styles are opaque objects, not regular styles!
   
   By default you can use `animated.div`, `animated.span` and `animated.img`, you can create your own by calling: `animated.createAnimatedComponent('h1')` or whatever element you need.


```jsx
import { Spring, animated } from 'react-spring'

const DIV = animated.div
const SVG = animated.createAnimatedComponent('svg')

const Content = ({ toggle, color, backgroundColor, transform }) => (
    <DIV style={{ backgroundColor }}>
        <SVG style={{ transform }} version="1.1" viewBox="0 0 400 400">
            <g style={{ color }} fillRule="evenodd" onClick={toggle}>
                <path id="path-1" d="M20,380 L380,380 L380,380 L200,20 L20,380 Z" />
            </g>
        </SVG>
    </DIV>
)

class App extends React.Component {
    state = { toggle: true }
    toggle = () => this.setState(state => ({ toggle: !state.toggle }))
    render() {
        const toggle = this.state.toggle
        return (
            <Spring
                native
                from={{ color: 'black' }}
                to={{
                    color: toggle ? '#247BA0' : '#70C1B3',
                    backgroundColor: toggle ? '#B2DBBF' : '#F3FFBD',
                    transform: [{ rotate: toggle ? '0deg' : '180deg' }, { scale: toggle ? 0.6 : 1.5 }],
                }}
                toggle={this.toggle}
                children={Content}
            />
        )
    }
}
```
