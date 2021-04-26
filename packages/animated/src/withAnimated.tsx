import * as React from 'react'
import { forwardRef, useRef, Ref, useCallback, useEffect } from 'react'
import {
  is,
  each,
  raf,
  useForceUpdate,
  useOnce,
  FluidEvent,
  FluidValue,
  addFluidObserver,
  removeFluidObserver,
  useLayoutEffect,
} from '@react-spring/shared'
import { ElementType } from '@react-spring/types'

import { AnimatedObject } from './AnimatedObject'
import { TreeContext } from './context'
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

    const [props, deps] = getAnimatedState(givenProps, host)

    const forceUpdate = useForceUpdate()

    const callback = () => {
      const instance = instanceRef.current
      if (hasInstance && !instance) {
        // Either this component was unmounted before changes could be
        // applied, or the wrapped component forgot to forward its ref.
        return
      }

      const didUpdate = instance
        ? host.applyAnimatedValues(instance, props.getValue(true))
        : false

      // Re-render the component when native updates fail.
      if (didUpdate === false) {
        forceUpdate()
      }
    }

    const observer = new PropsObserver(callback, deps)

    const observerRef = useRef<PropsObserver>()
    useLayoutEffect(() => {
      const lastObserver = observerRef.current
      observerRef.current = observer

      // Observe the latest dependencies.
      each(deps, dep => addFluidObserver(dep, observer))

      // Stop observing previous dependencies.
      if (lastObserver) {
        each(lastObserver.deps, dep => removeFluidObserver(dep, lastObserver))
        raf.cancel(lastObserver.update)
      }
    })

    useEffect(callback, [])
    // Stop observing on unmount.
    useOnce(() => () => {
      const observer = observerRef.current!
      each(observer.deps, dep => removeFluidObserver(dep, observer))
    })

    const usedProps = host.getComponentProps(props.getValue())
    return <Component {...usedProps} ref={ref} />
  })
}

class PropsObserver {
  constructor(readonly update: () => void, readonly deps: Set<FluidValue>) {}
  eventObserved(event: FluidEvent) {
    if (event.type == 'change') {
      raf.write(this.update)
    }
  }
}

type AnimatedState = [props: AnimatedObject, dependencies: Set<FluidValue>]

function getAnimatedState(props: any, host: HostConfig): AnimatedState {
  const dependencies = new Set<FluidValue>()
  TreeContext.dependencies = dependencies

  // Search the style for dependencies.
  if (props.style)
    props = {
      ...props,
      style: host.createAnimatedStyle(props.style),
    }

  // Search the props for dependencies.
  props = new AnimatedObject(props)

  TreeContext.dependencies = null
  return [props, dependencies]
}

function updateRef<T>(ref: Ref<T>, value: T) {
  if (ref) {
    if (is.fun(ref)) ref(value)
    else (ref as any).current = value
  }
  return value
}
