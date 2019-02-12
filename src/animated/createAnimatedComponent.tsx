import React, {
  ComponentPropsWithRef,
  forwardRef,
  MutableRefObject,
  ReactType,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { handleRef, useForceUpdate } from '../shared/helpers'
import AnimatedProps from './AnimatedProps'
import { animatedApi, applyAnimatedValues } from './Globals'

export default function createAnimatedComponent<C extends ReactType>(
  Component: C
) {
  const AnimatedComponent = forwardRef<C, ComponentPropsWithRef<C>>(
    (props, ref) => {
      const forceUpdate = useForceUpdate()
      const mounted = useRef(true)
      const propsAnimated = useRef<any>(null)
      const node: MutableRefObject<C | null> = useRef(null)
      const attachProps = useCallback(props => {
        const oldPropsAnimated = propsAnimated.current
        const callback = () => {
          if (node.current) {
            const didUpdate = applyAnimatedValues.fn(
              node.current,
              propsAnimated.current.getAnimatedValue()
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
        (animatedApi as any)(node, mounted, forceUpdate)
      )
      attachProps(props)

      const {
        scrollTop,
        scrollLeft,
        ...animatedProps
      } = propsAnimated.current.getValue()
      return (
        <Component
          {...animatedProps}
          ref={(childRef: C) => (node.current = handleRef(childRef, ref))}
        />
      )
    }
  )
  return AnimatedComponent
}
