# Changelog

## v9.1.2

### Fixes

- revert changes from [#1023](https://github.com/pmndrs/react-spring/pull/1023) because of a misunderstanding of the API
- resolve [#1419](https://github.com/pmndrs/react-spring/issues/1419) where `onStart` and `onRest` were not fired causing a build up of events in the queue.

### Chores

- Updating demos to work with `react-spring.io`

## v9.1.0

### Features

- We listened to the feedback people had, so whilst we encourage people to use the pattern `[styles, api] = useSpring()` we have aliased calling `api` to be `api.start` [#1359](https://github.com/pmndrs/react-spring/issues/1359)
- `POTENTIALLY BREAKING CHANGE` We've unified the return of all events `onStart`, `onChange`, `onRest` etc. to be the following - `(animationResult, controller, item)` item will only not be `undefined` when using `useTransition`.

### Fixes

- scrollTop is not set when from & to are equal [#1185](https://github.com/pmndrs/react-spring/issues/1185)
- skip animation with async to infinite loop [#1160](https://github.com/pmndrs/react-spring/issues/1160)
- Stop jank in animation when duration changes on SpringValue [#1163](https://github.com/pmndrs/react-spring/issues/1163)

### Chores

- We have our test suite working again! hooray, it means we can review and commit PR's quicker and more effectively
- We've updated all our examples in this repo to v9 [#1386](https://github.com/pmndrs/react-spring/pull/1386)

## v9.0.0

Say hello 👋 to **react-spring v9.0.0**, which comes with useful new features and fixes!!

You might run into _breaking changes_ 👻, so be sure your animations still work after upgrading.

### Unified API

In the past two major versions, the "Render Props API" and "Hooks API" were provided by separate modules. In fact, each API had its own implementation of the internal `Controller` class, which was bad for maintenance.

```jsx
import { useSpring } from 'react-spring'
import { Spring } from 'react-spring/renderprops'
```

The new version unifies these APIs into a single module!

```jsx
import { Spring, useSpring } from 'react-spring'

// The legacy module is still available:
import { Spring } from 'react-spring/renderprops'
```

⚠️ Note: Using `auto` as an end value is not supported by the `react-spring` module, but the `react-spring/renderprops` module still supports it.

### Improved types

TypeScript definitions have been rewritten for a better experience.

<br />

Changes include the following:

- Added tests to ensure types are never broken
- Smarter type inference
- More inline documentation

### Time-based diffing

"Time-based diffing" is a new strategy used when updating the props. It uses timestamps to know when props have been overridden.
In practice, this means that delayed animations can be selectively overridden without needing to call `stop` first.

```jsx
useSpring({
  from: { width: 10, height: 10 },
  to: async next => {
    // Create a delayed animation
    next({ width: 100, height: 100, delay: 2000 }) // 2 seconds
    // Immediately override the width animation
    next({ width: 50 }) // This creates a new animation which starts immediately,
    // and it prevents the delayed animation from changing
    // the width. The height will still animate in 2 seconds.
  },
})
```

This behavior comes in handy with `useTransition` when an `enter` animation only partially conflicts with an `update` or `leave` animation.

```jsx
useTransition(items, null, {
  from: { size: 0, color: 'green' },
  enter: { size: 100, color: 'black' },
  leave: { size: 0 }, // Once the "leave" animation begins, the "color" will continue
}) // animating from "green" to "black" since it never changed.
```

### Improved `useTransition`

You might know that the `enter`, `update`, and `leave` props of `useTransition` accept function values so you can customize the animations on an item-by-item basis.

```jsx
useTransition(items, {
  from: { width: 0 },
  enter: item => ({ width: item.width }),
})
```

In the past, the object returned by `enter` wasn't able to configure the animation, except for its `to` values. Now, you're free to include any props that can be passed to `useSpring`!

```jsx
useTransition(items, {
  from: { width: 0 },
  enter: item => ({
    width: item.width,
    delay: item.delay, // Per-item delay
    config: { duration: item.duration }, // Per-item spring config
    onChange: frame => {
      // Per-item event listeners
      console.log('onChange:', frame)
    },
  }),
})
```

### Improved async animations

Async animations are created when an array or async function is passed to `useSpring` as the `to` prop. Pass an array to create a chain of animations. Pass an async function to create animations on-the-fly by repeatedly calling the given `next` function.

```jsx
// Chaining with an array
useSpring({
  to: [{ opacity: 1 }, { color: 'red' }],
  from: { opacity: 0, color: 'black' },
})

// Chaining with an async function
useSpring({
  to: async next => {
    await next({ opacity: 1 })
    await next({ color: 'red' })
  },
  from: { opacity: 0, color: 'black' },
})
```

In the new version, the objects of your arrays and `next` calls are allowed to include any props that can be passed to `useSpring`.

```jsx
// Chaining with an array
useSpring({
  to: [
    { opacity: 1, config: { duration: 1000 } },
    { color: 'red', delay: 1000 },
  ],
  from: { opacity: 0, color: 'black' },
})

// Chaining with an async function
useSpring({
  to: async next => {
    await next({ opacity: 1, config: { duration: 1000 } })
    await next({ color: 'red', delay: 1000 })
  },
  from: { opacity: 0, color: 'black' },
})
```

⚠️ Additionally, async animations are no longer cancelled when the props are updated. Async chains (eg: `{`to: [{}, {}]`}`) are never cancelled, even if another chain begins. Async scripts (eg: `{`to: async () => {}`}`) are only interrupted when another script or chain begins.

### Added `cancel` prop

The `cancel` prop can be used anywhere the `reset` prop can be (eg: `useSpring`).

- When true, all animations are cancelled.
- When false, all animations are resumed.
- When a string, a single key has its animation cancelled.
- When an array of strings, multiple keys may have their animations cancelled.

```jsx
const props = useSpring({
cancel: true, // Cancel all animations
opacity: 1,
})

const props = useSpring({
cancel: 'foo', // Cancel the "foo" animation only
from: { foo: 0, bar: 0 }
to: { foo: 1, bar: 1 },
})

const props = useSpring({
cancel: ['foo', 'bar'], // Cancel multiple animations by key
from: { foo: 0, bar: 0 }
to: { foo: 1, bar: 1 },
})
```

The `reset` prop is ignored for all keys cancelled by the `cancel` prop.

### Improved `stop` function

When you pass a function as the first argument, the `useSpring` function returns two functions (one for updates, one for stops).

```js
const [props, update, stop] = useSpring(() => ({ opacity: 1 }))
```

Previously, the `stop` function wouldn't actually stop any animations, which made it seem broken.

In this version, it will stop _all_ animations (and prevent any delayed animations!) when called with no arguments. Additionally, you can pass an animated key (eg: `"opacity"`) if you only want to stop one property from animating.

```jsx
stop() // Stop all animations
stop('opacity') // Stop only the "opacity" animation
stop('opacity', 'width') // Stop "opacity" and "width"

stop(true) // Stop all animations and pretend like they finished
stop(true, 'width') // Stop "width" and pretend like it finished
```

### Repurposed `onStart` prop

The `onStart` prop is now called whenever an animated key is about to start animating to a new value. Previously, it was called every time the props were updated (even when no animations were actually started), which proved to be unreliable.

```jsx
useSpring({
  opacity: 1,
  from: { opacity: 0 },
  onStart(animation) {
    console.log(`Animating "${animation.key}":`, animation)
  },
})
```

### Reworked dependency injection

Dependency injection lets react-spring be compatible with multiple platforms. To support a new platform, you can import the `react-spring/universal` module and interact with its `Globals` export. To get an idea of how this is done, you can check out the existing platforms (eg: `src/targets/web.js`).

In v9.0.0, the `Globals` export now comes with only an `assign` method, instead of calling functions with names like `Globals.injectRequestFrame()`. The `Globals.assign` method takes an object of injected dependencies. You are not required to inject all possible dependencies, since most have sane defaults.

```jsx
import { Globals } from 'react-spring/universal'

// The old way
Globals.injectDefaultElement(View)
Globals.injectStringInterpolator(createStringInterpolator)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => ({ ...style, transform: new AnimatedTransform(style.transform) })
)

// The new way
Globals.assign({
  defaultElement: View,
  createStringInterpolator,
  applyAnimatedValues: (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  createAnimatedTransform: transform => new AnimatedTransform(transform),
})
```

Note: When using the `react-spring/universal` module, you must inject the `applyAnimatedValues` function. Everything else is optional. For other modules like `react-spring/native`, the required globals are injected for you.

```ts
export interface AnimatedGlobals {
  // Defaults to \`Date.now\`
  now?: () => number
  // To support colors like "red". Defaults to \`{}\`
  colorNames?: { [key: string]: number }
  // Usually the "div" of the platform. Defaults to \`undefined\`
  defaultElement?: any
  // Update the values of the affected nodes. Required
  applyAnimatedValues?: (node: any, props: object) => boolean | void
  // Wrap the \`transform\` property of an animated style
  createAnimatedTransform?: (transform: any) => any
  // Wrap the \`style\` property of an animated component
  createAnimatedStyle?: (style: any) => any
  // Create the \`ref\` API of an animated component
  createAnimatedRef?: (
    node: { current: any },
    mounted?: { current: boolean },
    forceUpdate?: () => void
  ) => { current: any }
  // Defaults to \`window.requestAnimationFrame\`
  requestAnimationFrame?: (onFrame: () => void) => number
  // Defaults to \`window.cancelAnimationFrame\`
  cancelAnimationFrame?: (handle: number) => void
  // Called on every frame. Defaults to \`undefined\`
  manualFrameloop?: () => void
  // Custom string interpolation. Defaults to \`undefined\`
  interpolation?: (config: object) => (input: number) => number | string
}
```

### Reworked `Controller` API

Lastly, for anyone interested in an imperative API, here's an example that demonstrates time-based diffing using the `Controller` class, which had a massive rewrite in v9.0.0.

```jsx
import { Controller, animated } from 'react-spring'

// Create a controller (aka: the manual API)
const spring = new Controller({
opacity: 1, // The initial props
width: '100%',
height: '100%',
backgroundColor: 'red',
})

// Inspect when each prop was last updated
console.log(spring.timestamps) // => { "to.opacity": now,
                                //      "to.width": now,
                                //      "to.height": now,
                                //      "to.backgroundColor": now }

// Use the animated values
<animated.div style={spring} />

// Create a delayed animation
spring.update({
opacity: 0,
width: '50%',
delay: 2000,
}).start(values => {
console.log('Final values:', values)
})

// Notice the props have not changed yet
assert(spring.props.opacity === 1)
assert(spring.props.width === '100%')

// You can override any prop (except the "delay" prop)
spring.update({
opacity: 0.5, // This prevents the delayed animation from changing the opacity.
}).start()      // NOTE: The width will still animate to "50%" two seconds from now.

// Other methods
spring.stop('opacity', 'width')
spring.destroy()
```

## react-spring 8.0

### Breaking changes

Migrating from 7.x to 8.0 is painless. The only breaking change is the default export. If you have previously done something like this:
`jsx import { Spring, animated, ... } from 'react-spring'`
Then you will now do:
`jsx import { Spring, animated, ... } from 'react-spring/renderprops'`
And if you have previously used hooks like so:
`jsx import { useSpring, animated, ... } from 'react-spring/hooks'`
You will now do:
`jsx import { useSpring, animated, ... } from 'react-spring'`
The lib comes with the following exports:

```bash
web (web/hooks, default for react-dom)
native (react-native/hooks, default for react-native)
renderprops-web (previously "web")
renderprops-native (previously "native")
renderprops-addons (previously "addons")
renderprops-konva (previously "konva")
renderprops-universal (previously "universal")
```

For commonjs, add ".cjs"
Both render-props and hooks will be kept and maintained for the forseeable future.

#### useTransition

```jsx
useTransition(items, keys, config)
```

See: <a href="/docs/props/transition">useTransition</a>

## react-spring 7.0

- ☂️ Hooks! useSpring, useTransition, useTrail & useKeyframes available under `react-spring/hooks`
- ✨ addons, native, konva and universal are available directly without `/dist/`
- 🐞 Bugfixes ...

### Breaking changes

Nothing, except the removal of `/dist/`, and the experimental useSpring export moved to `/hooks`. Should be good to go! 😊

## react-spring 6.0

- ⚡️ React strict-mode compliant and ready for async rendering
- 🚀 New spring engine (from RK4 to SEE), lots of internal changes making it faster and leaner
- ✨ Simpler and more intuitive api

### Configs

- ⏰ Duration is built in and as easy as going `{`config={{ duration: 1000, easing: ... }}`}`
- ⌛️ Delays can be driven per config `{`config={{ delay: 1000, ... }}`}`
- ✨ Simpler property names (mass, tension, friction, delay, precision, clamp, velocity, duration, easing)
- 🎩 Spring config props are 1:1 compatible with react-motions and the presets finally do what they say

### Springs

- ⏮ Springs can run `reverse`, which switches `from` and `to`
- 🚬 The `after` prop makes it easier to apply static values at the end of an animation
- 🐉 Springs can animate scrollTop/Left

### Transitions

- 🎉 Multistage transitions are finally possible. `Transition` inherits from `Keyframes` now, which allows it to receive the same values that you can use in slots, meaning you can chain or even script transitions
- ⭐️ The `unique` prop prevents two children with the same key to co-exist, which was an often asked for suggestion. If it is true, a fading-out item will vanish when an item with the same key comes in again, as opposed to forming a stack (which is still the default)
- ✖️ The `reset` prop, in combination with `unique` forces an incoming item to always start from scratch instead of adapting the fading-out item to take start-position
- 🐌 Transitions can trail using the `trail` prop which takes a duration in ms
- ✨ Simpler api. Previously you could optionally pass `items` and you would have to map over children yourself. `items` and `keys` are Transitions sole source of truth now. You give a single function child instead of mapping
- 🎮 Transition behaves more like Reacts TransitionGroup in that it can give you way more contextual information than before, you even have access to the state your output component is in (enter/leave/update)

### Trails

- ✨ Simpler api. Same as Transitions
- ⏮ The `reverse` prop can move a trail bottom-up instead of the default top-down which is more natural for items swinging in and out

### Keyframes

- ✨ Simpler api. You don't have to write `{`to: {...}`}` any longer since everything is interpolated to it

### Parallax

- 🤷‍ Parallax always felt off since it's not as generic as the others. It has been moved to `react-spring/dist/addons` and could mark the start of convenience components or effects that don't belong anywhere else

### Upgrading to 6.0

The changes made are mostly features, the api changes are slight and looking at the front page here will tell you immediately what to do. You will probably have to adapt your Transitions and Trail, Keyframes are backwards compatible. If you have used timings off `dist/addons` before, duration is now inbuilt (see above). A noticeable change also concerns spring config props, where before we would be closer to how the animated library interprets tension and friction we are now 1:1 compatible with react-motion.
