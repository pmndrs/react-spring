[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

    npm install react-spring

<b>Examples</b>: [Api demonstration](https://codesandbox.io/embed/oln44nx8xq) | [Native rendering](https://codesandbox.io/embed/882njxpz29) | [Single transition](https://codesandbox.io/embed/yj52v5689) | [Multiple item transition](https://codesandbox.io/embed/j150ykxrv) | [Animated Todo MVC](https://codesandbox.io/embed/2pk8l7n7kn)

# Why 🤔

React-spring is a wrapper around a cooked down fork of [Facebooks animated](http://animatedjs.github.io/interactive-docs/). It is trying to bridge Chenglou's [React-motion](https://github.com/chenglou/react-motion) and animated, as both have their pros and cons, but definitively could benefit from one another:

### React-motion

*   [x] Declarative api that doesn't involve manual management of animations
*   [x] Covers most of the essentials (springs, lists, transitions, reveals, staggered animations)
*   [ ] Performance can suffer because components are re-rendered every frame with fresh props
*   [ ] Can't interpolate between raw state as it doesn't know colors, paths, gradients, etc.

### Animated

*   [x] Interpolates most web privimites, units and patterns
*   [x] Efficiently writes to the dom directly instead of re-rendering components frame by frame
*   [ ] Managing and orchestrating handles (starting/stopping/waiting/cleaning) can become a real chore
*   [ ] Missing essential prototypes like mount/unmount transitions

So as you see, they're polar opposites and the strengths of one are the weaknesses of another. React-spring inherits React-motions api while you can feed it everything animated can interpolate. It also has support for animateds efficient native rendering.

# Default rendering 🏎

Like React-motion by default we'll render the receiving component every frame as it gives you more freedom to animate whatever you like. In many situations this will be ok.

```jsx
import { Spring } from 'react-spring'

const App = ({ toggle }) => (
    <Spring
        // Default values, optional ...
        from={{ opacity: 0 }}
        // Will animate to ...
        to={{
            // Can be numbers, colors, paths, degrees, percentages, ...
            color: toggle ? 'red' : '#00ff00',
            start: toggle ? '#abc' : 'rgb(10,20,30)',
            end: toggle ? 'seagreen' : 'rgba(0,0,0,0.5)',
            stop: toggle ? '0%' : '50%',
            scale: toggle ? 1 : 2,
            rotate: toggle ? '0deg' : '45deg',
            path: toggle
                ? 'M20,380 L380,380 L380,380 L200,20 L20,380 Z' 
                : 'M20,20 L20,380 L380,380 L380,20 L20,20 Z',
        }}>
        
        {({ color, scale, rotate, path, start, stop, end }) => (
            <div style={{ background: `linear-gradient(to bottom, ${start} ${stop}, ${end} 100%)` }}>
                <svg style={{ transform: `scale(${scale}) rotate(${rotate})` }}>
                    <g fill={color}>
                        <path d={path} />
                    </g>
                </svg>
            </div>
        )}
        
    </Spring>
)
```

Don't like the way render props wrap your code? You can always move out component definitions, like so:

```jsx
const Header = ({ text, ...styles }) => <h1 style={styles}>{text}</h1>

const App = () => (
    <Spring to={{ color: 'red' }} text="extra props are spread over the child" children={Header}/>
)
```

Et voilà! Now you render a animated version of the `Header` component! It's actually faster as well since the function isn't recreated on every prop-change.

# Native rendering 🚀

If you need more performance then pass the `native` flag. Now your component will only render once and all updates will be sent straight to the dom without any React reconciliation passes.

Just be aware of the following conditions:

1.  You can only animate styles and standard props, the values you receive are opaque objects, not regular values
2.  Receiving elements must be `animated.[elementName]`, for instance `div` becomes `animated.div`
3.  You can slap animated values right into styles and props, `style.transform` takes an array

```jsx
import { Spring, animated } from 'react-spring'

const App = ({ toggle }) => (
    <Spring
        native
        from={{ fill: 'black' }}
        to={{
            fill: toggle ? '#247BA0' : '#70C1B3',
            backgroundColor: toggle ? '#B2DBBF' : '#F3FFBD',
            rotate: toggle ? '0deg' : '180deg',
            scale: toggle ? 0.6 : 1.5,
            path: toggle ? TRIANGLE : RECTANGLE,
        }}>

        {({ fill, backgroundColor, rotate, scale, path }) => (
            <animated.div style={{ backgroundColor }}>
                <animated.svg style={{ transform: [{ rotate }, { scale }], fill }}>
                    <g><animated.path d={path} /></g>
                </animated.svg>
            </animated.div>
        )}

    </Spring>
)
```

If you need to interpolate native styles, use `template`. For instance, given that you receive the start of a gradient and its end as animatable values you could do it like so:

```jsx
import { Spring, animated, template } from 'react-spring'

const Content = ({ start, end }) => (
    <animated.h1 style={{ background: template`linear-gradient(${start} 0%, ${end} 100%)` }}>
        hello
    </animated.h1>
)

const App = () => (
    <Spring
        native
        from={{ start: 'black', end: 'black' }}
        to={{ start: '#70C1B3', end: 'seagreen' }}
        children={Content} />
)
```

# Transitions 🌔

Use `SpringTransition` and pass in your `keys`. `from` denotes base styles, `enter` styles are applied when objects appear, `leave` styles are applied when objects disappear. Keys and children have to match in their order! You can again use the `native` flag for direct dom animation.

```jsx
import { SpringTransition } from 'react-spring'

class AppContent extends PureComponent {
    state = { items: ['item1', 'item2', 'item3'] }

    componentDidMount() {
        setTimeout(() => this.setState({ items: ['item1', 'item2', 'item3', 'item4'] }), 2000)
        setTimeout(() => this.setState({ items: ['item1', 'item3', 'item4'] }), 4000)
    }

    render() {
        return (
            <ul>
                <SpringTransition
                    keys={this.state.items}
                    from={{ opacity: 0, color: 'black', height: 0 }}
                    enter={{ opacity: 1, color: 'red', height: 18 }}
                    leave={{ opacity: 0, color: 'blue', height: 0 }}>
                    
                    {this.state.items.map(item => styles => <li style={styles}>{item}</li>)}
                    
                </SpringTransition>
            </ul>
        )
    }
}
```

You can use this prototype for two-state reveals, in that case simply don't supply keys and render a single child that you can switch out for another any time!


```jsx
const App = ({ toggle }) => (
    <SpringTransition from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
        {toggle ? ComponentA : ComponentB}
    </SpringTransition>
)
```
