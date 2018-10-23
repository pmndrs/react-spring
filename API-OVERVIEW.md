# Table of Contents 👇

- [Springs and basic interpolation](#springs-and-basic-interpolation)
- [Render props](#render-props)
- [Native rendering and interpolation](#native-rendering-and-interpolation-demo)
- [Imperative Api](#imperative-api)
- [Transitions](#transitions)
- [Keyframes](#keyframes)
- [Parallax and page transitions](#parallax-and-page-transitions)

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

The `from` prop denotes initial values and `to` end-state values the spring will animate towards. Once the spring starts animating `from` plays no role any longer, it will from now on remember its current values and animate from there if you update `to`.

A couple of extra props you might be interested in are `onRest`, which fires once the animations stops, `onFrame`, which fires on every frame and gives you the animation value, `reset`, which literally resets the spring so that it goes through `from` to `to` again, `immediate` which can enforce values to spring to their to-values immediately (can be `true` for a zero-time spring or a function which receives the key names and returns `true` or `false` individually).

##### Animating 'auto'

react-spring is one of the few libs that understands and animates `auto`, so you can use it in your configs, like so:

```jsx
<Spring from={{ height: 0 }} to={{ height: 'auto' }}>
```

Keep in mind that in order to do this we have to measure out a snapshot set to `height/width: auto` before we can start animating it. There are some things you should watch out for:

1.  **Wrong width/height**. If you notice that the measured bounds are wrong, give your view more context, for instance set the `position` attribute of the parent container (the element that contains your spring) to either `absolute` or `relative` so that the view (the element that's inside your spring) retains bounds.

2.  **Contents change but won't animate**. If you set your spring to `auto` and later add or remove contents (children), it doesn't animate since it's essentially going from "auto" to "auto". In these rare cases you can use the `force` prop, which forces the spring to animate regardless of whether props are the same or not.

```jsx
<Spring force from={{ height: 0 }} to={{ height: 'auto' }}>
  {items.map(id => <Item key={id} />)}
```

3.  **Nested auto-springs eat into their animations**. If you nest springs and click one open and close another, the measurements will conflict for a moment. There is no real solution here. Something you can do to help it is make sure springs animate with less precision so that they will complete faster.

```jsx
<Spring
  from={{ height: 0 }} to={{ height: 'auto' }}
  config={{ ...config.default, restSpeedThreshold: 1, restDisplacementThreshold: 0.1 }}>
```

### Render props

Don't like the way render props wrap your code and create nested structures? By default we support both `render` and `children`, so you can create higher-order components like so:

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

1.  `native` only animates styles, attributes and children (as textContent)
2.  The values you receive _are opaque objects, not regular values_
3.  Receiving elements must be `animated.[elementName]`, for instance `div` becomes `animated.div`
4.  If you need to interpolate styles use `interpolate`

##### Single or multiple value interpolation

```jsx
import { Spring, animated, interpolate } from 'react-spring'

<Spring native from={{ radius: 0, time: 0, x: 0, y: 0 }} to={{ radius: 10, time: 1, x: 10, y: 20 }}>
    {({ radius, time, x, y }) => (
        <animated.div
            style={{
                // Use plain animated values like always, ...
                borderRadius: radius,
                // For interpolations, call "interpolate" on the value itself, it accepts a function
                background: time.interpolate(t => `rgba(0, 0, 0, ${t})`),
                // ... or supply a range clamp
                color: time.interpolate({ range: [0, 1], output: ['red', 'rgba(1, 50, 210, 0.5)'] }),
                // Or use generic interpolate, which takes multiple values, it accepts a function
                transform: interpolate([x, y], (x, y) => `translate(${x}px, ${y}px)`),
            }}>
        </animated.div>
    )}
</Spring>
```

##### More complex interpolations, chaining, clamping and ranges

In cases where you need to clamp or extrapolate, the `interpolate` function can take several properties that might be of interest to you. Specifically `range`, `output`, `filter`, `extrapolate`, `extrapolateLeft` and `extrapolateRight`. You can also chain results and interpolate further.

```jsx
<animated.div
  style={{
    transform: x
      .interpolate({
        // Map can route the input value through a custom filter
        // In this case we convert absolute values; helpful for delta-offsets for instance
        map: Math.abs,
        // Range and Output map input values to output values
        range: [50, 300],
        output: [0.5, 1],
        // Can be "extend" (default) or "clamp", clamp cut's off
        extrapolate: 'clamp',
      })
      .interpolate(x => `scale(${x})`), // interpolates the result of the above
  }}
/>
```

### Imperative Api

If it's necessary you can control your animations imperatively.

```jsx
import {
  AnimatedValue,
  animated,
  interpolate,
  controller as spring,
} from 'react-spring'

const App = ({ children }) => {
  const animation = new AnimatedValue('#28d79f')
  const hover = () => spring(animation, { to: '#c23369' }).start()
  const unhover = () => spring(animation, { to: '#28d79f' }).start()
  return (
    <animated.div
      style={{ background: animation }}
      onMouseOver={hover}
      onMouseOut={unhover}
    />
  )
}
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

You can use this prototype for two-state reveals, simply render a single child that you can switch out for another. You don't have to pass keys for this one.

```jsx
<Transition from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
  {toggle ? ComponentA : ComponentB}
</Transition>
```

If you need to track a single child, that is also possible:

```jsx
<Transition from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
  {toggle && Component}
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

### Keyframes

`Keyframes` allow you to chain, compose and orchestrate animations by creating predefined slots which you then execute by passing the `state` prop.

The resulting primitive can receive all the generic properties you would normally give your springs, like `native`, `from`, and so on.

```jsx
import { Keyframes, config } from 'react-spring'

// You can create keyframes for springs, trails and transitions
const Container = Keyframes.Spring({
    // Single props
    show: { to: { opacity: 1 } },
    // Chained animations (arrays)
    showAndHide: [ { to: { opacity: 1 } }, { to: { opacity: 0 } }],
    // Functions with side-effects with access to component props
    wiggle: async (next, ownProps) => {
        await next({ to: { x: 100 }, config: config.wobbly })
        await delay(1000)
        await next({ to: { x: 0 }, config: config.gentle })
    }
})

<Container state="show">
    {styles => <div style={styles}>Hello</div>}
</Container>
```

There is a shortcut for low-level scripting by giving it a function instead of an object consisting of slots (good for loops and such). In this case the state prop can be omitted.

```jsx
// Will fade children in and out in a loop
const Container = Keyframes.Spring(async next => {
  while (true) {
    await next({
      reset: true,
      from: { opacity: 0 },
      to: { opacity: 1 },
    })
  }
})

<Container>
    {styles => <div style={styles}>Hello</div>}
</Container>
```

And another for arrays:

```jsx
const Container = Keyframes.Spring([
  { to: { scale: 1.5 } },
  { to: { scale: 1 } },
])
```

`Spring` and `Trail` also have a `.to` shortcut to make it even leaner. It will try to interpolate animatable props, but you can still use regular Spring-props like delay, immediate and so on, just be aware that they are reserved.

```jsx
const Container = Keyframes.Spring.to([
  { immediate: true, delay: 500, scale: 1.5 },
  { scale: 1 },
])
```

If you have made [your own animation primitive](https://github.com/drcmda/react-spring/issues/97#issuecomment-392380139) and want to drive it through keyframes, that is also doable:

```jsx
const Container = Keyframes.create(MyOwnPrimitive)({ ... })
```

### Parallax and page transitions

`Parallax` creates a scroll container. Throw in any amount of layers and it will take care of moving them in accordance to their offsets and speeds.

`Parallax.pages` determines the total space of the inner content where each page takes 100% of the visible container. `ParallaxLayer.offset` determines where the layer will be at when scrolled to (0=start, 1=1st page, ...). `ParallaxLayer.speed` shifts the layer in accordance to its offset, values can be positive or negative.

```jsx
import { Parallax, ParallaxLayer } from 'react-spring'

<Parallax pages={3} scrolling={false} horizontal ref={ref => this.parallax = ref}>
    <ParallaxLayer offset={0} speed={0.5} onPositionChange={(to, height) => {}}>
        <span onClick={() => this.parallax.scrollTo(1)}>
            Layers can contain anything
        </span>
    </ParallaxLayer>
</Parallax>
```
