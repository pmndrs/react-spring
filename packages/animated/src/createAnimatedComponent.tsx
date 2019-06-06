import React, {
  forwardRef,
  ElementType,
  MutableRefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  Ref,
} from 'react'
import {
  AnimatedRef,
  createAnimatedRef,
  applyAnimatedValues,
} from 'shared/globals'
import { is, useForceUpdate, useOnce } from 'shared'
import { AnimatedProps } from './AnimatedProps'

export const createAnimatedComponent: CreateAnimated = <C extends ElementType>(
  Component: C
) =>
  forwardRef<C | AnimatedRef<C>>((props: any, ref) => {
    const node = useRef<C | AnimatedRef<C> | null>(null)
    const mounted = useRef(true)
    const propsAnimated = useRef<AnimatedProps | null>(null)
    const forceUpdate = useForceUpdate()

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
      return propsAnimated.current!.getValue()
    }, [])

    useOnce(() => () => {
      mounted.current = false
      propsAnimated.current && propsAnimated.current.detach()
    })
    useImperativeHandle(ref, () =>
      createAnimatedRef(node as MutableRefObject<C>, mounted, forceUpdate)
    )

    // TODO: Avoid special case for scrollTop/scrollLeft
    const { scrollTop, scrollLeft, ...animatedProps } = attachProps(props)
    return (
      <Component
        {...animatedProps as typeof props}
        ref={(childRef: C) => (node.current = handleRef(childRef, ref))}
      />
    )
  })

//
// withExtend()
//

export type WithExtend<T> = T & {
  extend: (
    ...args: Array<AnimatedTarget | Array<AnimatedTarget>>
  ) => WithExtend<T>
}

/** Strings like "div", or components, or a map of components, or an array of those */
type AnimatedTarget = string | ElementType | { [key: string]: ElementType }

// A stub type that gets replaced by @react-spring/web and others.
type CreateAnimated = (Component: ElementType) => any

/** Add an `extend` method to your `animated` factory function */
export function withExtend<T extends CreateAnimated>(
  animated: T,
  options: { lowercase?: boolean } = {}
): WithExtend<T> {
  const self: any = animated
  const extend = (
    arg: AnimatedTarget | AnimatedTarget[],
    overrideKey?: string | number
  ): void => {
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
    self[key] = animated(arg as ElementType)
  }
  self.extend = (...args: any[]) => {
    args.forEach(arg => extend(arg))
    return self
  }
  return self
}

function handleRef<T>(ref: T, forward: Ref<T>) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (is.fun(forward)) forward(ref)
    else if (is.obj(forward)) {
      // If it's an object and has a 'current' property, assume it's a ref object
      ;(forward as any).current = ref
    }
  }
  return ref
}
