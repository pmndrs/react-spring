[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

# Installation 🖥

    npm install react-spring

# Table of Contents 👇

*   [What is it?](#what-is-it-)
*   [Why do we need yet another?](#why-do-we-need-yet-another-)
*   [Overview](#overview-)
*   [API Overview](#api-overview-)
    *   [Springs and basic interpolation](#springs-and-basic-interpolation)
    *   [Render props](#render-props)
    *   [Native rendering and interpolation](#native-rendering-and-interpolation-demo)
    *   [Transitions](#transitions)
    *   [Parallax and page transitions](#parallax-and-page-transitions)

# What is it? 🤔

A set of simple, spring-physics based primitives that should cover most of your UI related animation needs once plain CSS can't cope any longer. Forget easings, durations, timeouts and so on as you fluidly move data from one state to another. This isn't meant to solve each and every problem but rather to give you tools flexible enough to confidently cast ideas into moving interfaces.

# Why do we need yet another? 🧐

react-spring is a cooked down fork of Christopher Chedeau's [animated](https://github.com/animatedjs/animated) (which is used in react-native by default). It is trying to bridge it with Cheng Lou's [react-motion](https://github.com/chenglou/react-motion). Although both are similarily spring-physics based they are still polar opposites.

|                | Declarative | Primitives | Interpolations | Performance |
| -------------- | ----------- | ---------- | -------------- | ----------- |
| React-motion   | ✅          | ✅         | ❌             | ❌          |
| Animated       | ❌          | ❌         | ✅             | ✅          |
| React-spring   | ✅          | ✅         | ✅             | ✅          |

react-spring builds upon animated's foundation, casting its imperative side out, making it leaner and more flexible. It inherits react-motions declarative api and goes to great lenghts to simplify it. It has lots of useful primitives (springs, trails, transitions, reveals, parallax), can interpolate mostly everything (colors, gradients, percentages, degrees, svg-paths, arrays, etc.) and last but not least, can animate by committing directly to the dom instead of re-rendering a component frame-by-frame.

# Overview 🔭

<p align="middle">
  <img src="assets/spring.gif" width="285" />
  <img src="assets/transitions.gif" width="285" /> 
  <img src="assets/trails.gif" width="285" /> 
</p>
<p align="middle">
  <img src="assets/tree.gif" width="285" />
  <img src="assets/sunburst.gif" width="285" /> 
  <img src="assets/areas.gif" width="285" /> 
</p>
<p align="middle">
  <img src="assets/gestures.gif" width="285" />
  <img src="assets/reveals.gif" width="285" /> 
  <img src="assets/morph.gif" width="285" /> 
</p>
<p align="middle">
  <img src="assets/vertical.gif" width="285" />
  <img src="assets/horizontal.gif" width="285" /> 
  <img src="assets/keyframes-trail.gif" width="285" /> 
</p>

#### Springs ([Demo](https://codesandbox.io/embed/oln44nx8xq))

<img src="assets/spring.gif" width="285" />

A `Spring` will move data from one state to another. It remembers the current state, value changes are always fluid.

```jsx
import { Spring } from 'react-spring'

<Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
    {styles => <div style={styles}>i will fade in</div>}
</Spring>
```

#### Mount/unmount Transitions ([Demo](https://codesandbox.io/embed/j150ykxrv))

<img src="assets/transitions.gif" width="285" />

`Transition` watches elements as they mount and unmount, it helps you to animate these changes.

```jsx
import { Transition } from 'react-spring'

<Transition
    keys={items.map(item => item.key)}
    from={{ opacity: 0, height: 0 }}
    enter={{ opacity: 1, height: 20 }}
    leave={{ opacity: 0, height: 0 }}>
    {items.map(item => styles => <li style={styles}>{item.text}</li>)}
</Transition>
```

#### 2-state Reveals ([Demo](https://codesandbox.io/embed/yj52v5689))

<img src="assets/reveals.gif" width="285" />

Given a single child instead of a list you can reveal components with it.

```jsx
import { Transition } from 'react-spring'

<Transition from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
    {toggle ? ComponentA : ComponentB}
</Transition>
```

#### Trails and staggered animations ([Demo](https://codesandbox.io/embed/vvmv6x01l5))

<img src="assets/trails.gif" width="285" />

`Trail` animates the first child of a list of elements, the rest follow the spring of their previous sibling.

```jsx
import { Trail } from 'react-spring'

<Trail from={{ opacity: 0 }} to={{ opacity: 1 }} keys={items.map(item => item.key)}>
    {items.map(item => styles => <div style={styles}>{item.text}</div>)}
</Trail>
```

#### Parallax and page transitions ([Demo](https://codesandbox.io/embed/548lqnmk6l))

<img src="assets/horizontal.gif" width="285" />

`Parallax` allows you to declaratively create page/scroll-based animations.

```jsx
import { Parallax } from 'react-spring'

<Parallax pages={2}>
    <Parallax.Layer offset={0} speed={0.2}>
        first Page
    </Parallax.Layer>
    <Parallax.Layer offset={1} speed={0.5}>
        second Page
    </Parallax.Layer>
</Parallax>
```

#### Keyframes ([Demo](https://codesandbox.io/embed/zl35mrkqmm))

<img src="assets/keyframes-trail.gif" width="285" />

`Keyframes` allows you to orchestrate animations in a script. Theretically you can even switch primitives, for instance going from a Spring, to a Trail, to a Transition. It tries its best to remember the last state so that animations are additive. The API is still experiemental and only available under the `@beta` tag.

```jsx
import { Keyframes, Spring } from 'react-spring'

<Keyframes script={async next => {
    await next(Spring, { from: { opacity: 0 }, to: { opacity: 1 } })
    await next(Spring, { from: { opacity: 0 }, to: { opacity: 0 } })
}}>
    {styles => <div style={styles}>Hello</div>}
</Keyframes>
```

#### Additional demos: [Vertical scroll](https://codesandbox.io/embed/0oonqxnpjl) | [Gestures](https://codesandbox.io/embed/jzn14k0ppy) | [Routing](https://codesandbox.io/embed/xo0lrqw2nz) | [Graphs](https://codesandbox.io/embed/j3x61vjz5v) | [TodoMVC](https://codesandbox.io/embed/2pk8l7n7kn) | [Drag/n/drop](https://codesandbox.io/embed/l9zqz0m18z) | [SVG morphing](https://codesandbox.io/embed/lwpkp46om)

# API overview 📖

For a raw documentation of all possible properties look [here](https://github.com/drcmda/react-spring/blob/master/API.md).

### Springs and basic interpolation

You can interpolate almost everything, from numbers, colors, svg-paths, percentages, arrays to string patterns:

```jsx
<spring to={{
    scale: toggle ? 1 : 2,
    start: toggle ? '#abc' : 'rgb(10,20,30)',
    end: toggle ? 'seagreen' : 'rgba(0,0,0,0.5)',
    stop: toggle ? '0%' : '50%',
    rotate: toggle ? '0deg' : '45deg',
    path: toggle ? 'M20,380 L380,380 L380,380 Z' : 'M20,20 L20,380 L380,380 Z',
    vector: toggle ? [1,2,50,100] : [20,30,1,-100],
}}>
```

A couple of extra props you might be interested in are `onRest`, which fires once the animations stops, `onFrame`, which fires on every frame and gives you the animation value, `reset`, which literally resets the spring so that it goes through `from` to `to` again, `immediate` which can enforce values to spring to their to-values immediately (can be `true` for a zero-time spring or an array where you can pass the key-names individually).

### Render props

Don't like the way render props wrap your code?

```jsx
const Header = ({ children, bold, ...styles }) => (
    <h1 style={styles}>
        {bold ? <b>{children}</b> : children}
    </h1>
)


<Spring render={Header} to={{ color: 'fuchsia' }} bold>
    hello there
</Spring>
```

Et voilà! `Header` animates on prop changes! Props that `Spring` doesn't recognize will be spread over the receiving component, in this example `bold`, but it also includes `children` if you use `render` to refer to the render-child.

### Native rendering and interpolation ([Demo](https://codesandbox.io/embed/882njxpz29))

By default we'll render the receiving component every frame as it gives you more freedom to animate. In situations where that becomes expensive add the `native` flag and animations will now be applied directly to the dom. The flag is available for all primitives (Spring, Transition & Trail, Parallax is native by design).

Just be aware of the following conditions:

1.  It only animates element styles and attributes, the values you receive _are opaque objects, not regular values_
2.  Receiving elements must be `animated.[elementName]`, for instance `div` becomes `animated.div`
3.  If you need to interpolate styles use the `template` string literal or `interpolate`

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

You have several interpolation options, not just `template`. `interpolate` can be called on the value itself or as a stand-alone function which can read multiple values. It accepts either a function which receives the animation value(/s), or a range.

```jsx
import { Spring, animated, interpolate } from 'react-spring'

<animated.svg 
    style={{ 
        transform: interpolate([x, y], (x, y) => `translate(${x}px, ${y}px)`), 
        color: time.interpolate({ inputRange: [0, 1], outputRange: ['red', 'rgba(1, 50, 210, 0.5)'] })
    }}>
    <g><animated.path d={time.interpolate(customSvgInterpolator)} /></g>
</animated.svg>
```

### Transitions

Animates children as they mount and unmount. `from` denotes base styles, `enter` styles are applied when objects appear, `leave` styles are applied when objects disappear. Keys and children have to match in their order! The keys are the same that you would provide in any other looping situation.

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

You can use this prototype for two-state reveals, simply render a single child that you can switch out for another. You don't have to pass keys for this one.

```jsx
<Transition from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
    {toggle ? ComponentA : ComponentB}
</Transition>
```

For more complex animations you can return per-object styles individually. Let Transition know the actual data by passing it raw to `items`, either pass your keys like always or give it an accessor. And for more control, there's `update` which fires for nodes that are neither entering nor leaving.

```jsx
<Transition
    items={items}
    keys={item => item.key}
    from={item => ({ opacity: 0 })}
    enter={item => ({ opacity: 1 })}
    update={item => ({ opacity: 0.5 })}
    leave={item => ({ opacity: 0 })}>
    {items.map(item => styles => <li style={styles}>{item.text}</li>)}
</Transition>
```

### Trails/Staggered transitions

`Trail` animates the first child of the list you pass, the others will follow in a trailing motion. The api is similar to `Transition` though it will assume your list is fixed.

```jsx
import { Trail } from 'react-spring'

<Trail from={{ opacity: 0 }} to={{ opacity: 1 }} keys={items.map(item => item.key)}>
    {items.map(item => styles => <div style={styles}>{item.text}</div>)}
</Trail>
```

### Parallax and page transitions

`Parallax` creates a scroll container. Throw in any amount of layers and it will take care of moving them in accordance to their offsets and speeds.

`Parallax.pages` determines the total space of the inner content where each page takes 100% of the visible container. `Layer.offset` determines where the layer will be at when scrolled to (0=start, 1=1st page, ...). `Layer.speed` shifts the layer in accordance to its offset, values can be positive or negative.

```jsx
import { Parallax } from 'react-spring'

<Parallax pages={3} scrolling={false} horizontal ref={ref => this.parallax = ref}>
    <Parallax.Layer offset={0} speed={0.5}>
        <span onClick={() => this.parallax.scrollTo(1)}>
            Layers can contain anything
        </span>
    </Parallax.Layer>
</Parallax>
```

# Links 🔗

[API](https://github.com/drcmda/react-spring/blob/master/API.md) | [Changelog](https://github.com/drcmda/react-spring/blob/master/CHANGELOG.md) | [MIT](https://github.com/drcmda/react-spring/blob/master/LICENSE)
