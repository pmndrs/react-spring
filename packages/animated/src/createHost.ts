import { Lookup } from '@react-spring/types'
import { is, eachProp } from '@react-spring/shared'
import { AnimatableComponent, withAnimated } from './withAnimated'
import { Animated } from './Animated'
import { AnimatedObject } from './AnimatedObject'

export interface HostConfig {
  /** Provide custom logic for native updates */
  applyAnimatedValues: (node: any, props: Lookup) => boolean | void
  /** Wrap the `style` prop with an animated node */
  createAnimatedStyle: (style: Lookup) => Animated
  /** Intercept props before they're passed to an animated component */
  getComponentProps: (props: Lookup) => typeof props
}

// A stub type that gets replaced by @react-spring/web and others.
type WithAnimated = {
  (Component: AnimatableComponent): any
  [key: string]: any
}

// For storing the animated version on the original component
const cacheKey = Symbol.for('AnimatedComponent')

// Fallback cache for component objects that are non-extensible (e.g. React
// Native host components on Hermes after their first JSX render). We try to
// write the cached wrapper on the component itself first; if that throws we
// fall back to this WeakMap so that `animated(View)` keeps working.
const fallbackCache = new WeakMap<object, any>()

export const createHost = (
  components: AnimatableComponent[] | { [key: string]: AnimatableComponent },
  {
    applyAnimatedValues = () => false,
    createAnimatedStyle = style => new AnimatedObject(style),
    getComponentProps = props => props,
  }: Partial<HostConfig> = {}
) => {
  const hostConfig: HostConfig = {
    applyAnimatedValues,
    createAnimatedStyle,
    getComponentProps,
  }

  const animated: WithAnimated = (Component: any) => {
    const displayName = getDisplayName(Component) || 'Anonymous'

    if (is.str(Component)) {
      Component =
        animated[Component] ||
        (animated[Component] = withAnimated(Component, hostConfig))
    } else {
      let cached = Component[cacheKey] ?? fallbackCache.get(Component)
      if (!cached) {
        cached = withAnimated(Component, hostConfig)
        try {
          Component[cacheKey] = cached
        } catch {
          // Component is non-extensible (e.g. a Hermes-optimised React Native
          // host component). Store in the module-level WeakMap instead.
        }
        fallbackCache.set(Component, cached)
      }
      Component = cached
    }

    Component.displayName = `Animated(${displayName})`
    return Component
  }

  eachProp(components, (Component, key) => {
    if (is.arr(components)) {
      key = getDisplayName(Component)!
    }
    animated[key] = animated(Component)
  })

  return {
    animated,
  }
}

const getDisplayName = (arg: AnimatableComponent) =>
  is.str(arg)
    ? arg
    : arg && is.str(arg.displayName)
      ? arg.displayName
      : (is.fun(arg) && arg.name) || null
