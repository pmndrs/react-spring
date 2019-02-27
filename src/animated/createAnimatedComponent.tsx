import React, {
  forwardRef,
  MutableRefObject,
  ReactType,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { handleRef, useForceUpdate } from '../shared/helpers'
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
          if (node.current) {
            const didUpdate = applyAnimatedValues.fn(
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
        animatedApi(node as MutableRefObject<C>, mounted, forceUpdate)
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

export default createAnimatedComponent
