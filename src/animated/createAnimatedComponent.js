import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react'
import AnimatedProps from './AnimatedProps'
import { handleRef, is, useForceUpdate } from '../shared/helpers'
import { applyAnimatedValues, animatedApi } from './Globals'

export default function createAnimatedComponent(Component) {
  const AnimatedComponent = forwardRef((props, ref) => {
    const forceUpdate = useForceUpdate()
    const mounted = useRef(true)
    const propsAnimated = useRef()
    const node = useRef()
    const attachProps = useCallback((props, state) => {
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

    useImperativeHandle(ref, () => animatedApi(node, mounted, forceUpdate))
    attachProps(props)

    const {
      scrolTop,
      scrollLeft,
      ...animatedProps
    } = propsAnimated.current.getValue()
    return (
      <Component
        {...animatedProps}
        ref={childRef => (node.current = handleRef(childRef, ref))}
      />
    )
  })
  return AnimatedComponent
}
