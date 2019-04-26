import React, {
  forwardRef,
  MutableRefObject,
  ReactType,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { handleRef, useForceUpdate, is } from '../shared/helpers'
import {
  AnimatedComponentProps,
  CreateAnimatedComponent,
} from '../types/animated'
import { AnimatedProps } from './AnimatedProps'
import { createAnimatedRef, applyAnimatedValues } from './Globals'

export const createAnimatedComponent: CreateAnimatedComponent = <
  C extends ReactType
>(
  Component: C
) => {
  const AnimatedComponent = forwardRef<C, AnimatedComponentProps<C>>(
    (props, ref) => {
      const forceUpdate = useForceUpdate()
      const mounted = useRef(true)
      const propsAnimated: MutableRefObject<AnimatedProps | null> = useRef(null)
      const node: MutableRefObject<C | null> = useRef(null)
      const attachProps = useCallback(props => {
        const oldPropsAnimated = propsAnimated.current
        const callback = () => {
          if (node.current) {
            const didUpdate = applyAnimatedValues(
              node.current,
              propsAnimated.current!.getAnimatedValue()
            )
            if (didUpdate === false) forceUpdate()
          }
        }
        propsAnimated.current = new AnimatedProps(props, callback)
        oldPropsAnimated && oldPropsAnimated.detach()
      }, [])

      useEffect(
        () => () => {
          mounted.current = false
          propsAnimated.current && propsAnimated.current.detach()
        },
        []
      )
      useImperativeHandle<C, any>(ref, () =>
        createAnimatedRef(node as MutableRefObject<C>, mounted, forceUpdate)
      )
      attachProps(props)

      const {
        scrollTop,
        scrollLeft,
        ...animatedProps
      } = propsAnimated.current!.getValue()
      return (
        <Component
          {...animatedProps as typeof props}
          ref={(childRef: C) => (node.current = handleRef(childRef, ref))}
        />
      )
    }
  )
  return AnimatedComponent
}

/**
 * withExtend(animated, options = {})
 */

type WithExtend<T> = T & {
  extend: (
    ...args: Array<AnimatedTarget | Array<AnimatedTarget>>
  ) => WithExtend<T>
}

/** Strings like "div", or components, or a map of components, or an array of those */
export type AnimatedTarget = string | ReactType | { [key: string]: ReactType }

/** Add an `extend` method to your `animated` factory function */
export function withExtend<T extends CreateAnimatedComponent>(
  animated: T,
  options: { lowercase?: boolean } = {}
) {
  const self = animated as WithExtend<T> & {
    [key: string]: ReactType
  }
  self.extend = (...args) => {
    args.forEach(arg => extend(arg))
    return self
  }
  return self as WithExtend<T>

  function extend(
    arg: AnimatedTarget | AnimatedTarget[],
    overrideKey?: string | number
  ): void {
    // Arrays avoid passing their index to `extend`
    if (is.arr(arg)) {
      return arg.forEach(arg => extend(arg))
    }

    // Object keys are always used over value inspection
    if (is.obj(arg)) {
      for (const key in arg) extend(arg[key], key)
      return
    }

    // Use the `overrideKey` or inspect the value for a key
    let key = is.str(overrideKey)
      ? overrideKey
      : is.str(arg)
      ? arg
      : arg && is.str(arg.displayName)
      ? arg.displayName
      : is.fun(arg)
      ? arg.name
      : ''

    // This lowercases the first letter of the key
    if (options.lowercase) {
      key = key[0].toLowerCase() + key.slice(1)
    }

    // NOTE(typescript): Properties are not yet inferred from the arguments of
    // the `extend` method and then attached to the `animated` function via
    // the return type.
    self[key] = animated(arg as ReactType)
  }
}

export { createAnimatedComponent as animated }
