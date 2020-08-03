import * as React from 'react'
import { forwardRef, useRef, Ref, useCallback } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import { is, each, useForceUpdate, FluidConfig } from '@react-spring/shared'
import { ElementType } from '@react-spring/types'

import { AnimatedProps } from './AnimatedProps'
import { HostConfig } from './createHost'

export type AnimatableComponent = string | Exclude<ElementType, string>

export const withAnimated = (Component: any, host: HostConfig) => {
  const hasInstance: boolean =
    // Function components must use "forwardRef" to avoid being
    // re-rendered on every animation frame.
    !is.fun(Component) ||
    (Component.prototype && Component.prototype.isReactComponent)

  return forwardRef((givenProps: any, givenRef: Ref<any>) => {
    const instanceRef = useRef<any>(null)

    // The `hasInstance` value is constant, so we can safely avoid
    // the `useCallback` invocation when `hasInstance` is false.
    const ref =
      hasInstance &&
      useCallback(
        (value: any) => {
          instanceRef.current = updateRef(givenRef, value)
        },
        [givenRef]
      )

    const forceUpdate = useForceUpdate()
    const props = new AnimatedProps(() => {
      const instance = instanceRef.current
      if (hasInstance && !instance) {
        return // The wrapped component forgot to forward its ref.
      }

      const didUpdate = instance
        ? host.applyAnimatedValues(instance, props.getValue(true)!)
        : false

      // Re-render the component when native updates fail.
      if (didUpdate === false) {
        forceUpdate()
      }
    })

    const dependencies = new Set<FluidConfig>()
    props.setValue(givenProps, { dependencies, host })

    useLayoutEffect(() => {
      each(dependencies, dep => dep.addChild(props))
      return () => each(dependencies, dep => dep.removeChild(props))
    })

    const usedProps = host.getComponentProps(props.getValue()!)
    return <Component {...usedProps} ref={ref} />
  })
}

function updateRef<T>(ref: Ref<T>, value: T) {
  if (ref) {
    if (is.fun(ref)) ref(value)
    else (ref as any).current = value
  }
  return value
}
