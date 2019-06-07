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
import AnimatedProps from './AnimatedProps'
import { animatedApi, applyAnimatedValues } from './Globals'

const createAnimatedComponent: CreateAnimatedComponent = <C extends ReactType>(
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
          let didUpdate: false | undefined = false
          if (node.current) {
            didUpdate = applyAnimatedValues.fn(
              node.current,
              propsAnimated.current!.getAnimatedValue()
            )
          }
          if (!node.current || didUpdate === false) {
            // If no referenced node has been found, or the update target didn't have a
            // native-responder, then forceUpdate the animation ...
            forceUpdate()
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
        animatedApi(node as MutableRefObject<C>, mounted, forceUpdate)
      )
      attachProps(props)

      const {
        scrollTop,
        scrollLeft,
        ...animatedProps
      } = propsAnimated.current!.getValue()

      // Functions cannot have refs, see:
      // See: https://github.com/react-spring/react-spring/issues/569
      const refFn = is.fun(Component)
        ? undefined
        : (childRef: C) => (node.current = handleRef(childRef, ref))
      return <Component {...animatedProps as typeof props} ref={refFn} />
    }
  )
  return AnimatedComponent
}

export default createAnimatedComponent
