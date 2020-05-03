import React, { forwardRef, useRef, Ref } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import { is, each, useForceUpdate, ElementType, FluidConfig } from 'shared'

import { AnimatedProps } from './AnimatedProps'
import { HostConfig } from './createHost'

export type AnimatableComponent = string | Exclude<ElementType, string>

export const withAnimated = (Component: any, host: HostConfig) =>
  forwardRef((rawProps: any, ref: Ref<any>) => {
    const instanceRef = useRef<any>(null)
    const hasInstance: boolean =
      // Function components must use "forwardRef" to avoid being
      // re-rendered on every animation frame.
      !is.fun(Component) ||
      (Component.prototype && Component.prototype.isReactComponent)

    const forceUpdate = useForceUpdate()
    const props = new AnimatedProps(() => {
      const instance = instanceRef.current
      if (hasInstance && !instance) {
        return // The wrapped component forgot to forward its ref.
      }

      const didUpdate = instance
        ? host.applyAnimatedValues(instance, props.getValue(true))
        : false

      // Re-render the component when native updates fail.
      if (didUpdate === false) {
        forceUpdate()
      }
    })

    const dependencies = new Set<FluidConfig>()
    props.setValue(rawProps, { dependencies, host })

    useLayoutEffect(() => {
      each(dependencies, dep => dep.addChild(props))
      return () => each(dependencies, dep => dep.removeChild(props))
    })

    return (
      <Component
        {...host.getComponentProps(props.getValue())}
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
