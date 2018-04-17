[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

# Installation 🖥

    npm install react-spring

# Table of Contents 👇

* [What is it?](#what-is-it-)
* [Why do we need yet another?](#why-do-we-need-yet-another-)
* [Overview](#overview-)
* [Example collection](#example-collection-)
* [API Overview](#api-overview-)
  * [Springs and basic interpolation](#springs-and-basic-interpolation)
  * [Render props](#render-props)
  * [Native rendering and interpolation](#native-rendering-and-interpolation-demo)
  * [Transitions](#transitions)
  * [Parallax and page transitions](#parallax-and-page-transitions)

# What is it? 🤔

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
<p align="middle">
  <img src="assets/dragndrop.gif" width="285" />
  <img src="assets/stream.gif" width="285" />
  <img src="assets/time.gif" width="285" />
</p>

A set of simple, spring-physics based primitives (as in building blocks) that should cover most of your UI related animation needs once plain CSS can't cope any longer. Forget easings, durations, timeouts and so on as you fluidly move data from one state to another. This isn't meant to solve each and every problem but rather to give you tools flexible enough to confidently cast ideas into moving interfaces.

# Why do we need yet another? 🧐

react-spring is a cooked down fork of Christopher Chedeau's [animated](https://github.com/animatedjs/animated) (which is used in react-native by default). It is trying to bridge it with Cheng Lou's [react-motion](https://github.com/chenglou/react-motion). Although both are similarily spring-physics based they are still polar opposites.

|                | Declarative | Primitives | Interpolations | Performance |
| -------------- | ----------- | ---------- | -------------- | ----------- |
| React-motion   | ✅          | ✅         | ❌             | ❌          |
| Animated       | ❌          | ❌         | ✅             | ✅          |
| React-spring   | ✅          | ✅         | ✅             | ✅          |

react-spring builds upon animated's foundation, casting its imperative side out, making it leaner and more flexible. It inherits react-motions declarative api and goes to great lengths to simplify it. It has lots of useful primitives, can interpolate mostly everything and last but not least, can animate by committing directly to the dom instead of re-rendering a component frame-by-frame.

For a more detailed explanation read [Why React needed yet another animation library](https://medium.com/@drcmda/why-react-needed-yet-another-animation-library-introducing-react-spring-8212e424c5ce).

# Overview 🔭

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
import { Parallax, ParallaxLayer } from 'react-spring'

<Parallax pages={2}>
    <ParallaxLayer offset={0} speed={0.2}>
        first Page
    </ParallaxLayer>
    <ParallaxLayer offset={1} speed={0.5}>
        second Page
    </ParallaxLayer>
</Parallax>
```

#### Time/duration-based implementations and addons ([Demo](https://codesandbox.io/embed/q9lozyymr9))

<img src="assets/time.gif" width="285" />

You'll find varying implementations under [/dist/addons](https://github.com/drcmda/react-spring/tree/master/src/addons). For now there's a time-based animation as well common [easings](https://github.com/drcmda/react-spring/blob/master/src/addons/Easing.js), and IOS'es harmonic oscillator spring. All primitives understand the `impl` property which you can use to switch implementations.

```jsx
import { TimingAnimation, Easing } from 'react-spring/dist/addons'

<Spring impl={TimingAnimation} config={{ delay: 200, duration: 1000, Easing.linear }} ...>
```

#### Keyframes ([Demo](https://codesandbox.io/embed/zl35mrkqmm))

<img src="assets/keyframes-trail.gif" width="285" />

`Keyframes` orchestrates animations in a script that you provide. Theoretically you can even switch between primitives, for instance going from a Spring, to a Trail, to a Transition. It tries its best to remember the last state so that animations are additive. Animation can be awaited and return current props. Be warned: the keyframe API is still highly experiemental and can be subject to changes.

```jsx
import { Keyframes, Spring } from 'react-spring'

<Keyframes script={async next => {
    await next(Spring, { from: { opacity: 0 }, to: { opacity: 1 } })
    await next(Spring, { to: { opacity: 0 } })
}}>
    {styles => <div style={styles}>Hello</div>}
</Keyframes>
```

# Example collection ⚡️

* Springs and interpolation: https://codesandbox.io/embed/oln44nx8xq
* Native springs: https://codesandbox.io/embed/882njxpz29
* Animating 'auto': https://codesandbox.io/embed/pmjomxn60
* Mount/Unmount transitions: https://codesandbox.io/embed/j150ykxrv
* Reveals: https://codesandbox.io/embed/yj52v5689
* Trails/Staggered motion: https://codesandbox.io/embed/vvmv6x01l5
* Horizontal paged parallax: https://codesandbox.io/embed/548lqnmk6l
* Vertical scrolled parallax: https://codesandbox.io/embed/0oonqxnpjl
* Time/duration https://codesandbox.io/embed/q9lozyymr9
* Keyframes/single script: https://codesandbox.io/embed/j1w4355593
* Keyframes/multiple scripts: https://codesandbox.io/embed/zl35mrkqmm
* SVG morphing/custom interpolaters: https://codesandbox.io/embed/lwpkp46om
* D3 stream graps: https://codesandbox.io/embed/py3p5p11m7
* D3 area graphs: https://codesandbox.io/embed/j3x61vjz5v
* D3 sunbursts: https://codesandbox.io/embed/nww6yxo0jl
* D3 trees: https://codesandbox.io/embed/9jrjqvq954
* Routing: https://codesandbox.io/embed/mjnwrk1o3p
* Horizontal gestures / occlude: https://codesandbox.io/embed/jzn14k0ppy
* Vertical gestures / drag-n-drop: https://codesandbox.io/embed/l9zqz0m18z
* Animated TodoMVC: https://codesandbox.io/embed/2pk8l7n7kn

# API overview 📖

For a raw documentation of all possible properties look [here](https://github.com/drcmda/react-spring/blob/master/API.md).

### Springs and basic interpolation

You can interpolate almost everything, from numbers, colors, svg-paths, percentages, arrays to string patterns:

```jsx
<Spring to={{
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

| ![img](assets/without-native.jpeg)                                                                                                                                                                                        | ![img](assets/with-native.jpeg)                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <sub>Libraries animate by having React recalculate the component-tree on every frame. Here it attempts to animate a component consisting of ~300 sub-components, plowing through the frame budget and causing jank.</sub> | <sub>React-spring with the `native` property renders the component _only once_, from then on the animation will be applied directly to the dom in a requestAnimationFrame-loop, similar to how gsap and d3 do it.</sub> |

---

By default we'll render every frame (like in the image on the left) as it gives you more freedom (for instance this is the only way that you can animate React-component props). In situations where that becomes expensive use the `native` flag. The flag is available for all primitives (Spring, Transition & Trail, Keyframes, Parallax is native by design). **Try doing this in all situations where you can**, the benefits are worth it. Especially if your animated component consists of large subtrees, routes, etc.

Just be aware of the following conditions:

1.  `native` only animates styles and attributes
2.  The values you receive _are opaque objects, not regular values_
3.  Receiving elements must be `animated.[elementName]`, for instance `div` becomes `animated.div`
4.  If you need to interpolate styles use `interpolate`

```jsx
import { Spring, animated, interpolate } from 'react-spring'

<Spring native from={{ radius: 0, time: 0, x: 0, y: 0 }} to={{ radius: 10, time: 1, x: 10, y: 20 }}>
    {({ radius, time, x, y }) => (
        <animated.div
            style={{
                // Use plain animated values like always, ...
                borderRadius: radius,
                // For interpolations, call "interpolate" on the value itself, it accepts a function
                background: time.interpolate(t => 'rgba(0, 0, 0, ${t})'),
                // ... or supply a range clamp
                color: time.interpolate({ range: [0, 1], output: ['red', 'rgba(1, 50, 210, 0.5)'] }),
                // Or use generic interpolate, which takes multiple values, it accepts a function
                transform: interpolate([x, y], (x, y) => `translate(${x}px, ${y}px)`),
            }}>
        </animated.div>
    )}
</Spring>
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
  leave={item => ({ opacity: 0 })}
>
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

`Parallax.pages` determines the total space of the inner content where each page takes 100% of the visible container. `ParallaxLayer.offset` determines where the layer will be at when scrolled to (0=start, 1=1st page, ...). `ParallaxLayer.speed` shifts the layer in accordance to its offset, values can be positive or negative.

```jsx
import { Parallax, ParallaxLayer } from 'react-spring'

<Parallax pages={3} scrolling={false} horizontal ref={ref => this.parallax = ref}>
    <ParallaxLayer offset={0} speed={0.5}>
        <span onClick={() => this.parallax.scrollTo(1)}>
            Layers can contain anything
        </span>
    </ParallaxLayer>
</Parallax>
```

# Links 🔗

[API](https://github.com/drcmda/react-spring/blob/master/API.md) | [Changelog](https://github.com/drcmda/react-spring/blob/master/CHANGELOG.md) | [MIT](https://github.com/drcmda/react-spring/blob/master/LICENSE)
