import React, { forwardRef, useRef, Ref } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import { is, each, useForceUpdate, ElementType, FluidConfig } from 'shared'
import * as G from 'shared/globals'

import { AnimatedProps } from './AnimatedProps'

// For storing the animated version on the original component
const cacheKey = Symbol.for('AnimatedComponent')

type AnimatableComponent = string | Exclude<ElementType, string>

// A stub type that gets replaced by @react-spring/web and others.
type WithAnimated = {
  (Component: AnimatableComponent): any
  [key: string]: any
}

export const withAnimated: WithAnimated = (Component: any) => {
  const animated = is.str(Component)
    ? createAnimatedComponent(Component)
    : Component[cacheKey] ||
      (Component[cacheKey] = createAnimatedComponent(Component))

  animated.displayName = `Animated(${
    is.str(Component)
      ? Component
      : Component.displayName || Component.name || 'Anonymous'
  })`

  return animated
}

const createAnimatedComponent = (Component: any) =>
  forwardRef((rawProps: any, ref: Ref<any>) => {
    const instanceRef = useRef<any>(null)
    const hasInstance: boolean =
      // Function components must use "forwardRef" to avoid being
      // re-rendered on every animation frame.
      !is.fun(Component) || Component.prototype.isReactComponent

    const forceUpdate = useForceUpdate()
    const props = new AnimatedProps(() => {
      const instance = instanceRef.current
      if (hasInstance && !instance) {
        return // The wrapped component forgot to forward its ref.
      }

      const didUpdate = instance
        ? G.applyAnimatedValues(instance, props.getValue(true))
        : false

      // Re-render the component when native updates fail.
      if (didUpdate === false) {
        forceUpdate()
      }
    })

    const dependencies = new Set<FluidConfig>()
    props.setValue(rawProps, { dependencies })

    useLayoutEffect(() => {
      each(dependencies, dep => dep.addChild(props))
      return () => each(dependencies, dep => dep.removeChild(props))
    })

    return (
      <Component
        {...G.getComponentProps(props.getValue())}
        ref={
          hasInstance &&
          ((value: any) => {
            instanceRef.current = updateRef(ref, value)
          })
        }
      />
    )
  })

function updateRef<T>(ref: Ref<T>, value: T) {
  if (ref) {
    if (is.fun(ref)) ref(value)
    else (ref as any).current = value
  }
  return value
}

/**
 * Pass the given components to `withAnimated` and add the newly animated
 * components to `withAnimated` as properties.
 */
export const extendAnimated = (
  withAnimated: WithAnimated,
  components: AnimatableComponent[],
  lowercase?: boolean
): any => {
  components.forEach(Component => {
    let key = getDisplayName(Component)!
    if (lowercase) {
      key = key[0].toLowerCase() + key.slice(1)
    }
    withAnimated[key] = withAnimated(Component)
  })
  return withAnimated
}

const getDisplayName = (arg: AnimatableComponent) =>
  is.str(arg)
    ? arg
    : arg && is.str(arg.displayName)
    ? arg.displayName
    : (is.fun(arg) && arg.name) || null
