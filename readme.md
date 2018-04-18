[![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring)

# Installation 🖥

    npm install react-spring

# Table of Contents 👇

* [What is it?](#what-is-it-)
* [Why do we need yet another?](#why-do-we-need-yet-another-)
* [Overview](#overview-)
* [**Examples**](https://github.com/drcmda/react-spring/blob/master/examples/README.md)
* [API Overview](https://github.com/drcmda/react-spring/blob/master/API-OVERVIEW.md)
* [API Detailed](https://github.com/drcmda/react-spring/blob/master/API.md)

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

# Links 🔗

[API](https://github.com/drcmda/react-spring/blob/master/API.md) | [Changelog](https://github.com/drcmda/react-spring/blob/master/CHANGELOG.md) | [MIT](https://github.com/drcmda/react-spring/blob/master/LICENSE)
