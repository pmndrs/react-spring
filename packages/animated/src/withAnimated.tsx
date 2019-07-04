import React, { forwardRef, useRef, Ref, useEffect } from 'react'
import { is, useForceUpdate, useOnce, ElementType } from 'shared'
import { AnimatedProps } from './AnimatedProps'
import * as G from 'shared/globals'

// For storing the animated version on the original component
const cacheKey = Symbol.for('AnimatedComponent')

type AnimatableComponent = string | Exclude<ElementType, string>

// A stub type that gets replaced by @react-spring/web and others.
type WithAnimated = {
  (Component: AnimatableComponent): any
  [key: string]: any
}

export const withAnimated: WithAnimated = (Component: any) =>
  is.str(Component)
    ? createAnimatedComponent(Component)
    : Component[cacheKey] ||
      (Component[cacheKey] = createAnimatedComponent(Component))

const createAnimatedComponent = (Component: any) =>
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
