import React, {
  ComponentPropsWithRef,
  forwardRef,
  ForwardRefExoticComponent,
  MutableRefObject,
  PropsWithoutRef,
  ReactType,
  RefAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { handleRef, useForceUpdate } from '../shared/helpers'
import { SpringValue } from './Animated'
import AnimatedProps from './AnimatedProps'
import { animatedApi, applyAnimatedValues } from './Globals'

type AnimateProperties<T extends object | undefined> = {
  [P in keyof T]: SpringValue<T[P]> | T[P]
}

type AnimateStyleProp<P extends object> = P extends { style?: object }
  ?
      | P
      | (P extends { style: object }
          ? Record<'style', AnimateProperties<P['style']>>
          : Partial<Record<'style', AnimateProperties<P['style']>>>)
  : P

type ScrollProps = {
  scrollLeft?: SpringValue<number>
  scrollTop?: SpringValue<number>
}

type AnimatedComponentProps<C extends ReactType> = JSX.LibraryManagedAttributes<
  C,
  AnimateStyleProp<ComponentPropsWithRef<C>> & ScrollProps
>

export interface CreateAnimatedComponent<C extends ReactType> {
  (Component: C): ForwardRefExoticComponent<
    PropsWithoutRef<AnimatedComponentProps<C>> & RefAttributes<C>
  >
}

const createAnimatedComponent: CreateAnimatedComponent<ReactType> = <
  C extends ReactType
>(
  Component: C
) => {
  const AnimatedComponent = forwardRef<C, AnimatedComponentProps<C>>(
    (props, ref) => {
      const forceUpdate = useForceUpdate()
      const mounted = useRef(true)
      const propsAnimated: MutableRefObject<any> = useRef(null)
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
        animatedApi(node as MutableRefObject<C>, mounted, forceUpdate)
      )
      attachProps(props)

      const {
        scrollTop,
        scrollLeft,
        ...animatedProps
      } = propsAnimated.current.getValue()
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
