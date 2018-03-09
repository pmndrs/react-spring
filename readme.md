[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

    npm install react-spring

<b>Examples</b>: [Api demonstration](https://codesandbox.io/embed/oln44nx8xq) | [Super fast native rendering](https://codesandbox.io/embed/882njxpz29) | [Transitions](https://codesandbox.io/embed/j150ykxrv)

# Why 🤔

React-spring is a wrapper around a cooked down fork of [Facebooks animated](http://animatedjs.github.io/interactive-docs/). It is trying to bridge Chenglou's [React-motion](https://github.com/chenglou/react-motion) and animated as both have their pros and cons, but definitively could benefit from one another:

### React-motion

- [x] Declarative api that doesn't involve manual management of handles
- [ ] Performance can suffer because components are re-rendered every frame
- [ ] Can't interpolate between raw state as it doesn't know colors, paths, gradients, etc. 

### Animated

- [x] Interpolates most web privimites, units and patterns
- [x] Efficiently changes styles in the dom instead of re-rendering a component with fresh props frame by frame
- [ ] Managing and orchestrating handles (starting/stopping/waiting/cleaning) can become a real chore

This lib inherits React-motions api while you can feed it everything animated can interpolate. It also has support for animateds efficient native rendering.

# Default rendering 🐎

Like React-motion by default we'll render the receiving component every frame as it gives you more freedom to animate whatever you like. In many situations this will be ok.

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
const Content = ({ startColor, endColor }) => {
    const background = animated.template`linear-gradient(bottom ${startColor} 0%, ${endColor} 100%)`
    return (
        <animated.div style={{ background }}>
            ...
        </animated.div>
    )
)
```

# Transitions ☔️

Use `SpringTransition` and pass in your `keys`. `from` denotes base styles, `enter` styles are applied when objects appear, `leave` styles are applied when objects disappear. You do not pass in components as children but rather functions that receive a style object. Keys and children have to match in their order! You can again use the `native` flag for direct dom animation. 

```jsx
import React, { PureComponent } from 'react'
import { SpringTransition, animated } from 'react-spring'

export default class AppContent extends PureComponent {
    state = { items: ['item1', 'item2', 'item3'] }

    componentDidMount() {
        setTimeout(() => this.setState({ items: ['item1', 'item2', 'item3', 'item4'] }), 2000)
        setTimeout(() => this.setState({ items: ['item1', 'item3', 'item4'] }), 4000)
    }
    
    render() {
        return (
            <ul>
                <SpringTransition
                    native
                    keys={this.state.items}
                    from={{ opacity: 0, color: 'black', height: 0 }}
                    enter={{ opacity: 1, color: 'red', height: 18 }}
                    leave={{ opacity: 0, color: 'blue', height: 0 }}>
                    {this.state.items.map(item => styles => (
                        <animated.li style={{ overflow: 'hidden', ...styles }}>{item}</animated.li>
                    ))}
                </SpringTransition>
            </ul>
        )
    }
}
```
