# Spring configs

```jsx
import { config } from 'react-spring'

<Spring config={config.default} />
```

```jsx
/*
    default: { tension: 170, friction: 26 },
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
    slow: { tension: 280, friction: 60 },
*/
```

- tension, controls the initial plus force of the spring when let loose (default: 170)
- friction, controls the opposition or antagonistic minus force (default: 26)
- velocity, controls the initial velocity of the object attached to the spring (default: 0)
- overshootClamping, controls if the spring should be clamped and not bounce (default: false)
- restSpeedThreshold, precision (default: 0.0001)
- restDisplacementThreshold, displacement precision (default: 0.0001)

# Spring

```jsx
import { Spring } from 'react-spring'
```

```jsx
class Spring extends React.PureComponent {
  static propTypes = {
    // Will skip rendering the component if true and write to the dom directly
    native: PropTypes.bool,
    // Base styles, optional
    from: PropTypes.object,
    // Animates to ...
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    // Callback when the animation starts to animate
    onStart: PropTypes.func,
    // Callback when the animation comes to a still-stand
    onRest: PropTypes.func,
    // Frame by frame callback, first argument passed is the animated value
    onFrame: PropTypes.func,
    // Takes a function that receives interpolated styles
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.func),
    ]),
    // Same as children, but takes precedence if present
    render: PropTypes.func,
    // Prevents animation if true, you can also pass individual keys
    immediate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    // Spring config ({ tension, friction, ... } or a function receiving a name)
    config: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    // Animation start delay, optional
    delay: PropTypes.number,
    // When true it literally resets: from -> to
    reset: PropTypes.bool,
    // Escape hatch for cases where you supply the same values, but need spring to
    // animate anyway, this can be useful for animating "auto" for instance, where "auto"
    // remains unchanged, but children change (which normally wouldn't trigger an animation update)
    force: PropTypes.bool,
  }
  static defaultProps = {
    from: {},
    to: {},
    config: config.default,
    native: false,
    immediate: false,
    reset: false,
    force: false,
    impl: SpringAnimation,
    inject: Globals.bugfixes,
  }
}
```

# Transition

```jsx
import { Transition } from 'react-spring'
```

```jsx
class Transition extends React.PureComponent {
  static propTypes = {
    native: PropTypes.bool,
    config: PropTypes.object,
    // Base styles
    from: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    // Animated styles when the component is mounted
    enter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    // Unmount styles
    leave: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    // fires for nodes that are neither entering nor leaving
    update: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    // A collection of unique keys that must match with the childrens order
    // Can be omitted if children/render aren't an array
    // Can be a function, which then acts as a key-accessor which is useful when you use the items prop
    keys: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      ),
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ]),
    // Optional. Let items refer to the actual data and from/enter/leaver/update can return per-object styles
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.object,
        ])
      ),
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
      ]),
    ]),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
    render: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
  }

  static defaultProps = {
    from: {},
    enter: {},
    leave: {},
    native: false,
    config: config.default,
  }
}
```

# Trail

```jsx
import { Trail } from 'react-spring'
```

```jsx
class Trail extends React.PureComponent {
  static propTypes = {
    native: PropTypes.bool,
    config: PropTypes.object,
    from: PropTypes.object,
    to: PropTypes.object,
    keys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
    render: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.func),
      PropTypes.func,
    ]),
  }
  static defaultProps = {
    from: {},
    to: {},
    native: false,
    config: config.default,
  }
}
```

# Parallax

```jsx
import { Parallax, ParallaxLayer } from 'react-spring'
```

```jsx
class Parallax extends React.PureComponent {
  static propTypes = {
    // Total (inner) height/width of the scroll container
    pages: PropTypes.number.isRequired,
    config: PropTypes.object,
    // Has a scrollbar or doesn't ...
    scrolling: PropTypes.bool,
    // Scroll horizontally or vertically
    horizontal: PropTypes.bool,
  }

  static defaultProps = {
    config: config.slow,
    scrolling: true,
    horizontal: false,
  }
}

class ParallaxLayer extends React.PureComponent {
  static propTypes = {
    // Size of a page, by default 1
    factor: PropTypes.number,
    // Where the layer will be projected to (0=start, 1=first page, ...)
    offset: PropTypes.number,
    // Speed (and direction) it scrolls there, can be positive or negative
    speed: PropTypes.number,
  }

  static defaultProps = {
    factor: 1,
    offset: 0,
    speed: 0,
  }
}
```

# Keyframes

```jsx
export default class Keyframes extends React.Component {
  static create = primitive => states => {
    if (typeof states === 'function') states = { [DEFAULT]: states }
    return props => (
      <Keyframes primitive={primitive} states={states} {...props} />
    )
  }

  // Factory functions, take an object with named slots.
  // A slot can be raw-props, an array of props, or an async function
  static Spring = Keyframes.create(Spring)
  static Trail = Keyframes.create(Trail)
  static Transition = Keyframes.create(Transition)

  static propTypes = {
    // Name of the current slot
    state: PropTypes.string,
  }
}
```
