import React, { forwardRef, useRef, Ref, useEffect } from 'react'
import { is, useForceUpdate, useOnce, ElementType, each } from 'shared'
import { AnimatedProps } from './AnimatedProps'
import * as G from 'shared/globals'

export const createAnimatedComponent: CreateAnimated = Component =>
  forwardRef((rawProps: any, ref: Ref<any>) => {
    const node = useRef<any>(null)
    const props = useRef<AnimatedProps | null>(null)

    const forceUpdate = useForceUpdate()
    const nextProps = new AnimatedProps(rawProps, () => {
      const didUpdate =
        !!node.current &&
        G.applyAnimatedValues(node.current, nextProps.getValue(true))

      // Re-render the component when native updates fail.
      if (didUpdate === false) {
        forceUpdate()
      }
    })

    useEffect(() => {
      const prevProps = props.current
      props.current = nextProps

      // To avoid causing a cascade of detachment, we must detach
      // the old props only *after* the new props are attached.
      nextProps._attach()
      if (prevProps) {
        prevProps._detach()
      }
    })

    // Ensure the latest props are detached on unmount.
    useOnce(() => () => {
      props.current!._detach()
    })

    // Functions cannot have refs (see #569)
    const refFn =
      !is.fun(Component) || Component.prototype.isReactComponent
        ? (value: any) => (node.current = updateRef(ref, value))
        : void 0

    rawProps = G.getComponentProps(nextProps.getValue())
    return <Component {...rawProps} ref={refFn} />
  })

function updateRef<T>(ref: Ref<T>, value: T) {
  if (ref) {
    if (is.fun(ref)) ref(value)
    else (ref as any).current = value
  }
  return value
}

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
type CreateAnimated = (Component: string | ElementType) => any

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
    if (is.arr(arg) || is.obj(arg)) {
      return each(arg as any, extend)
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
    self[key] = animated(arg)
  }
  self.extend = (...args: any[]) => {
    each(args, arg => extend(arg))
    return self
  }
  return self
}
