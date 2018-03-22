[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

    npm install react-spring

<b>Examples</b>: [Interpolation](https://codesandbox.io/embed/oln44nx8xq) | [Native rendering](https://codesandbox.io/embed/882njxpz29) | [Reveals](https://codesandbox.io/embed/yj52v5689) | [Transitions](https://codesandbox.io/embed/j150ykxrv) | [Staggered](https://codesandbox.io/embed/vvmv6x01l5) | [Parallax](https://codesandbox.io/embed/548lqnmk6l) | [TodoMVC](https://codesandbox.io/embed/2pk8l7n7kn) | [DragList](https://codesandbox.io/embed/l9zqz0m18z)

# Why 🤔

React-spring is a wrapper around a cooked down fork of [Facebooks animated](http://animatedjs.github.io/interactive-docs/). It is trying to cross it with Chenglou's [React-motion](https://github.com/chenglou/react-motion). Both have their pros and cons and could benefit from one another:

#### React-motion

*   [x] Declarative api that doesn't involve manual management of animations
*   [x] Covers most of the essentials (springs, lists, transitions, reveals, staggered animations)
*   [ ] Performance can suffer because components are re-rendered every frame with fresh props
*   [ ] Can't interpolate between raw state as it doesn't know colors, paths, gradients, etc.

#### Animated

*   [x] Interpolates most web privimites, units and patterns
*   [x] Efficiently writes to the dom directly instead of re-rendering components frame by frame
*   [ ] Managing and orchestrating handles (starting/stopping/waiting/cleaning) can become a real chore
*   [ ] Missing essential prototypes like mount/unmount transitions

As you see, they're polar opposites. React-spring inherits React-motions api, but simplified, while adding more primitives and being able to interpolate. It also has support for native rendering, where components animate directly in the dom.

# Overview 🔭

```jsx
import { Spring, Transition, Trail, Parallax } from 'react-spring'
```

### Springs

<p align="center">
  <img src="assets/spring.gif"/>
</p>

```jsx
<Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
    {styles => <div style={styles}>i will fade in</div>}
</Spring>
```

### Mount/unmount transitions

<p align="center">
  <img src="assets/transition.gif"/>
</p>

```jsx
<Transition
    keys={items.map(item => item.key)}
    from={{ opacity: 0 }}
    enter={{ opacity: 1 }}
    leave={{ opacity: 0 }}>
    {items.map(item => styles => <li style={styles}>{item.text}</li>)}
</Transition>
```

### Reveals

<p align="center">
  <img src="assets/reveal.gif"/>
</p>

```jsx
<Transition
    keys={toggle ? 'ComponentA' : 'ComponentB'} 
    from={{ opacity: 0 }} 
    enter={{ opacity: 1 }} 
    leave={{ opacity: 0 }}>
    {toggle ? ComponentA : ComponentB}
</Transition>
```

### Trails/staggered animations

<p align="center">
  <img src="assets/trail.gif"/>
</p>

```jsx
<Trail from={{ opacity: 0 }} to={{ opacity: 1 }} keys={items.map(item => item.key)}>
    {items.map(item => styles => <div style={styles}>{item.text}</div>)}
</Trail>
```

### Parallax & page transitions

<p align="center">
  <img src="assets/parallax.gif"/>
</p>

```jsx
<Parallax pages={2}>
    <Parallax.Layer offset={0} speed={0.2}>first Page</Parallax.Layer>
    <Parallax.Layer offset={1} speed={0.5}>second Page</Parallax.Layer>
</Parallax>
```

# API

## Springs and default rendering

([Demo](https://codesandbox.io/embed/oln44nx8xq))

You can interpolate almost everything, from numbers, colors, svg-paths, percentages, arrays to string patterns:

```jsx
<spring to={{
    start: toggle ? '#abc' : 'rgb(10,20,30)',
    end: toggle ? 'seagreen' : 'rgba(0,0,0,0.5)',
    stop: toggle ? '0%' : '50%',
    scale: toggle ? 1 : 2,
    rotate: toggle ? '0deg' : '45deg',
    path: toggle ? 'M20,380 L380,380 L380,380 Z' : 'M20,20 L20,380 L380,380 Z' }}>
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

## Native rendering

([Demo](https://codesandbox.io/embed/882njxpz29))

Like React-motion by default we'll render the receiving component every frame as it gives you more freedom to animate whatever you like. That means you can animate dom styles & props, but also any React component. In some situations this can be expensive.

Pass the `native` flag and the animations will now be applied *directly* to the dom through requestAnimationFrame. The component will only re-render when it receives new props. The flag is available for all primitives (Spring, Transition & Trail, Parallax is native by design).

Just be aware of the following conditions:

1.  It only animates standard styles and element props, the values you receive *are opaque objects, not regular values*
2.  Receiving elements must be `animated.[elementName]`, for instance `div` becomes `animated.div`
3.  If you need to interpolate styles use the `template` string literal

```jsx
import { Spring, animated, template } from 'react-spring'

<Spring native to={{ path, rotate, scale }}>
    {({ rotate, scale, path }) => (
        <animated.svg style={{ transform: template`rotate(${rotate}) scale(${scale})` }}>
            <g><animated.path d={path} /></g>
        </animated.svg>
    )}
</Spring>
```

## Transitions

([Demo](https://codesandbox.io/embed/j150ykxrv))

Use `Transition` and pass in your `keys`. `from` denotes base styles, `enter` styles are applied when objects appear, `leave` styles are applied when objects disappear. Keys and children have to match in their order!

```jsx
import { Transition } from 'react-spring'

<ul>
    <Transition
        keys={items.map(item => item.key)}
        from={{ opacity: 0, height: 0 }}
        enter={{ opacity: 1, height: 20 }}
        leave={{ opacity: 0, height: 0 }}>
        {items.map(item => styles => <li style={styles}>{item.text}</li>)}
    </Transition>
</ul>
```

You can use this prototype for two-state reveals, simply render a single child that you can switch out for another.

```jsx
<Transition
    keys={toggle ? 'ComponentA' : 'ComponentB'} 
    from={{ opacity: 0 }} 
    enter={{ opacity: 1 }} 
    leave={{ opacity: 0 }}>
    {toggle ? ComponentA : ComponentB}
</Transition>
```

## Trails/Staggered transitions

([Demo](https://codesandbox.io/embed/vvmv6x01l5))

Create trailing animations by using `Trail`. The api is similar to `Transition` though it will assume your list is fixed. The items will interpolate in a staggered fashion, internally one spring follows the interpolated value of the previous one thereby creating a staggered chain.

```jsx
import { Trail } from 'react-spring'

<Trail from={{ opacity: 0 }} to={{ opacity: 1 }} keys={items.map(item => item.key)}>
    {items.map(item => styles => <div style={styles}>{item.text}</div>)}
</Trail>
```

## Parallax and page transitions

([Demo](https://codesandbox.io/embed/548lqnmk6l))

`Parallax` creates a scroll container. Throw in any amount of layers and it will take care of moving them in accordance to their offsets and scrolling speeds. This makes complex page transitions as effortless as it gets.

`Parallax.pages` determines the total height/width of the inner content where each page takes 100% height of the visible container. `Layer.offset` determines where the layer will be at when scrolled to (0=start, 1=1st page, and so on ...). `Layer.speed` allows for positive and negative values, it shifts the layer in accordance to its offset.

```jsx
import { Parallax } from 'react-spring'

<Parallax pages={3} scrolling={false} horizontal ref={ref => this.parallax = ref}>
    <Parallax.Layer offset={0} speed={0.5}>
        <span onClick={() => this.parallax.scrollTo(1)}>>
            Layers can contain anything
        </span>
    </Parallax.Layer>
</Parallax>
```

---

[API](https://github.com/drcmda/react-spring/blob/master/API.md) | [Changelog](https://github.com/drcmda/react-spring/blob/master/CHANGELOG.md)
