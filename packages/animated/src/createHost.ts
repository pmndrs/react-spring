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
      Component =
        Component[cacheKey] ||
        (Component[cacheKey] = withAnimated(Component, hostConfig))
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
