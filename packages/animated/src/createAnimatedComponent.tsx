import React, { forwardRef, useCallback, useRef, Ref } from 'react'
import * as G from 'shared/globals'
import { is, useForceUpdate, useOnce, ElementType } from 'shared'
import { AnimatedProps } from './AnimatedProps'

export const createAnimatedComponent: CreateAnimated = Component =>
  forwardRef((props: any, ref: Ref<any>) => {
    const propsAnimated = useRef<AnimatedProps | null>(null)
    const forceUpdate = useForceUpdate()

    const node = useRef<any>(null)
    const attachProps = useCallback(props => {
      const oldPropsAnimated = propsAnimated.current
      const callback = () => {
        const didUpdate =
          !!node.current &&
          G.applyAnimatedValues(
            node.current,
            propsAnimated.current!.getAnimatedValue()
          )

        // If no referenced node has been found, or the update target didn't have a
        // native-responder, then forceUpdate the animation ...
        if (didUpdate === false) forceUpdate()
      }
      propsAnimated.current = new AnimatedProps(props, callback)
      oldPropsAnimated && oldPropsAnimated.detach()
      return propsAnimated.current!.getValue()
    }, [])

    useOnce(() => () => {
      propsAnimated.current && propsAnimated.current.detach()
    })

    // TODO: Avoid special case for scrollTop/scrollLeft
    const { scrollTop, scrollLeft, ...animatedProps } = attachProps(props)

    // Functions cannot have refs (see #569)
    const refFn =
      !is.fun(Component) || Component.prototype.isReactComponent
        ? (value: any) => (node.current = updateRef(ref, value))
        : void 0

    return <Component {...(animatedProps as typeof props)} ref={refFn} />
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
    self[key] = animated(arg)
  }
  self.extend = (...args: any[]) => {
    args.forEach(arg => extend(arg))
    return self
  }
  return self
}
