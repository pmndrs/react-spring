[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

    npm install react-spring

<b>Examples</b>: [Interpolation](https://codesandbox.io/embed/oln44nx8xq) | [Native rendering](https://codesandbox.io/embed/882njxpz29) | [Reveals](https://codesandbox.io/embed/yj52v5689) | [List transitions](https://codesandbox.io/embed/j150ykxrv) | [Staggered](https://codesandbox.io/embed/vvmv6x01l5) | [TodoMVC](https://codesandbox.io/embed/2pk8l7n7kn) | [DragList](https://codesandbox.io/embed/l9zqz0m18z) | [Graphs](https://codesandbox.io/embed/j3x61vjz5v)

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

([Demo](https://codesandbox.io/embed/oln44nx8xq))

Like React-motion by default we'll render the receiving component every frame as it gives you more freedom to animate whatever you like. In many situations this will be ok.

```jsx
import { Spring } from 'react-spring'

const App = ({ toggle }) => (
    <Spring
        // Default values, optional ...
        from={{ opacity: 0 }}
        // Will animate to ...
        to={{
            // Can be numbers, colors, paths, degrees, percentages, arrays, ...
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
                    <g><path d={path} /></g>
                </svg>
            </div>
        )}
        
    </Spring>
)
```

Don't like the way render props wrap your code?

```jsx
const Header = ({ children, ...styles }) => (
    <h1 style={styles}>
        {children}
    </h1>
)

const App = ({ color, children }) => (
    <Spring to={{ color }} render={Header}>
        {children}
    </Spring>
)
```

Et voilà! Now you render a animated version of the `Header` component! All props that `Spring` doesn't recognize as its own will be spread over the receiving component, including `children` if you use `render` instead. It's actually faster as well since the function isn't recreated on every prop-change.

# Native rendering 🚀

([Demo](https://codesandbox.io/embed/882njxpz29))

Pass the `native` flag for more performance. The animations will now be applied *directly* to the dom through requestAnimationFrame and the component will only render when it receives new props. The flag is available for all primitives (Spring, SpringTransition & SpringTrail).

Just be aware of the following conditions:

1.  It only animates standard styles and element props, the values you receive *are opaque objects, not regular values*
2.  Receiving elements must be `animated.[elementName]`, for instance `div` becomes `animated.div`
3.  If you need to interpolate styles use the `template` string literal

```jsx
import { Spring, animated, template } from 'react-spring'

const App = ({ toggle }) => (
    <Spring
        native
        from={{ fill: 'black' }}
        to={{
            rotate: toggle ? '0deg' : '180deg',
            scale: toggle ? 1 : 2,
            path: toggle ? TRIANGLE : RECTANGLE,
        }}>

        {({ rotate, scale, path }) => (
            <animated.svg style={{ transform: template`rotate(${rotate}) scale(${scale})` }}>
                <g><animated.path d={path} /></g>
            </animated.svg>
        )}

    </Spring>
)
```

# Transitions 🌑🌒🌓🌔🌕

([Demo](https://codesandbox.io/embed/j150ykxrv))

Use `SpringTransition` and pass in your `keys`. `from` denotes base styles, `enter` styles are applied when objects appear, `leave` styles are applied when objects disappear. Keys and children have to match in their order!

```jsx
import { SpringTransition } from 'react-spring'

const App = ({ items }) => (
    <ul>
        <SpringTransition
            keys={items.map(item => item.key)}
            from={{ opacity: 0, color: 'black', height: 0 }}
            enter={{ opacity: 1, color: 'red', height: 18 }}
            leave={{ opacity: 0, color: 'blue', height: 0 }}>
            {items.map(item => styles => <li style={styles}>{item.text}</li>)}
        </SpringTransition>
     </ul>
  )
}
```

You can use this prototype for two-state reveals, simply render a single child that you can switch out for another.


```jsx
const App = ({ toggle }) => (
    <SpringTransition
        keys={toggle ? 'ComponentA' : 'ComponentB'} 
        from={{ opacity: 0 }} 
        enter={{ opacity: 1 }} 
        leave={{ opacity: 0 }}>
        {toggle ? ComponentA : ComponentB}
    </SpringTransition>
)
```

# Trails/Staggered transitions 🐾🐾🐾

([Demo](https://codesandbox.io/embed/vvmv6x01l5))

Create trailing animations by using `SpringTrail`. The api is similar to `SpringTransition` though it will assume your list is fixed. The items will interpolate in a staggered fashion, internally one spring follows the interpolated value of the previous one thereby creating a staggered chain.

```jsx
import { SpringTrail } from 'react-spring'

const App = ({ items }) => (
    <SpringTrail from={{ opacity: 0 }} to={{ opacity: 1 }} keys={items.map(item => item.key)}>
        {items.map(item => styles => (
            <div style={styles}>
                {item.text}
            </div>
        ))}
    </SpringTrail>
)
```

---

[API](https://github.com/drcmda/react-spring/blob/master/API.md) | [Changelog](https://github.com/drcmda/react-spring/blob/master/CHANGELOG.md)
