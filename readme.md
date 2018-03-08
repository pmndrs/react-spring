    npm install react-spring

Demo: https://codesandbox.io/embed/oln44nx8xq

# Why 🤔

React-spring is a wrapper around a cooked down fork of [Facebooks animated](http://animatedjs.github.io/interactive-docs/). It is trying to bridge Chenglou's [React-motion](https://github.com/chenglou/react-motion) and animated as both have their pros and cons, but definitively could benefit from one another:

### React-motion

- [x] Declarative api that doesn't involve manual management of handles
- [ ] Performance suffers because components are re-rendered on every frame
- [ ] Can't interpolate between raw state as it doesn't know colors, paths, gradients, etc. 

### Animated

- [x] Very powerful, lots of features
- [x] Very efficient, it does not re-render components and changes styles directly in the dom
- [ ] Managing and orchestrating handles becomes a real chore

This lib inherits React-motions api (Spring -> Motion, from -> defaultStyles, to -> styles) while you can feed it everything animated can take in as well as allowing for native animations.

# Default rendering 🐎

Like React-motion by default we'll render the receiving component on every frame as it gives you more freedom to animate whatever you like. In most situations this will be ok.

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

# Native rendering 🚀

If you need more performance then pass the `native` flag. Now your component will only render once and all updates will be sent straight to the dom without any React reconciliation passes.

Just be aware of the following conditions:

1. You can only animate native styles and props
2. If you use transforms make sure it's an array
3. Receiving components have to be "animated components"
4. The values you receive are opaque objects, not regular values

Demo: https://codesandbox.io/embed/882njxpz29

```jsx
import { Spring, animated } from 'react-spring'

const Content = ({ toggle, fill, backgroundColor, transform, path }) => (
    <animated.div style={{ backgroundColor }}>
        <animated.svg style={{ transform, fill }} version="1.1" viewBox="0 0 400 400">
            <g fillRule="evenodd" onClick={toggle}>
                <animated.path id="path-1" d={path} />
            </g>
        </animated.svg>
    </animated.div>
)

class App extends React.Component {
    state = { toggle: true }
    toggle = () => this.setState(state => ({ toggle: !state.toggle }))
    render() {
        const toggle = this.state.toggle
        return (
            <Spring
                native
                from={{ fill: 'black' }}
                to={{
                    fill: toggle ? '#247BA0' : '#70C1B3',
                    backgroundColor: toggle ? '#B2DBBF' : '#F3FFBD',
                    transform: [{ rotate: toggle ? '0deg' : '180deg' }, { scale: toggle ? 0.6 : 1.5 }],
                    path: toggle ? TRIANGLE : RECTANGLE,
                }}
                toggle={this.toggle}
                children={Content}
            />
        )
    }
}
```

If you need to interpolate native styles, use `animated.template`. For instance, given that you receive startColor and endColor as animatable values you could do it like so:

```jsx
const Content = ({ startColor, EndColor }) => {
    const background = animated.template`linear-gradient(bottom ${startColor} 0%, ${EndColor} 100%)`
    return (
        <animated.div style={{ background }}>
            ...
        </animated.div>
    )
)
```

