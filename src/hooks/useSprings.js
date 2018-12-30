import {
  useRef,
  useState,
  useMemo,
  useCallback,
  useImperativeMethods,
  useEffect,
} from 'react'
import Ctrl from '../animated/Controller'
import { callProp } from '../shared/helpers'
import { requestFrame } from '../animated/Globals'
import KeyframeController from '../animated/KeyframeController'

export const useSpringsImpl = (type = 'default') => (
  length,
  props,
  initialProps = {}
) => {
  const isFn = typeof props === 'function'
  const [, forceUpdate] = useState()
  const { config, reverse, onKeyframesHalt, onRest, ...rest } = initialProps
  // The controller maintains the animation values, starts and tops animations
  const instances = useMemo(
    () => {
      const instances = []
      for (let i = 0; i < length; i++) {
        const initProps = { ...rest, ...(isFn ? callProp(props, i) : props[i]) }
        instances.push(
          type === 'keyframe'
            ? new KeyframeController(initProps)
            : new Ctrl(initProps)
        )
      }
      return instances
    },
    [length]
  )
  // Destroy controllers on unmount
  const instancesRef = useRef()
  instancesRef.current = instances
  useEffect(() => () => instancesRef.current.forEach(i => i.destroy()), [])
  // Define onEnd callbacks and resolvers
  const onHalt = onKeyframesHalt
    ? ctrl => ({ finished }) => finished && onRest && onRest(ctrl.merged)
    : onKeyframesHalt || (() => null)

  // The hooks explcit API gets defined here ...
  useImperativeMethods(rest.ref, () => ({
    start: () =>
      Promise.all(
        Array.from(instancesRef.current).map(
          ([, ctrl], i) =>
            (reverse ? i === 0 : instancesRef.current.size - 1) && onHalt(ctrl)
        )
      ),
    get isActive() {
      Array.from(instancesRef.current).some(([, ctrl]) => ctrl.isActive)
    },
    stop: (finished = false) =>
      instancesRef.current.forEach(([, ctrl]) => ctrl.stop(finished)),
  }))

  // Defines the hooks setter, which updates the controller
  const updateCtrl = useCallback(
    props => {
      instances.forEach((ctrl, i) => {
        const last = reverse ? i === 0 : instances.length - 1 === i
        const initProps = { ...rest, ...(isFn ? callProp(props, i) : props[i]) }
        ctrl.props.reset && type === 'keyframe' && last
          ? ctrl.updateWithForceUpdate(forceUpdate, initProps)
          : ctrl.update(initProps)

        if (!ctrl.props.ref) ctrl.start(last && onHalt(ctrl))
        if (last && ctrl.props.reset) requestFrame(forceUpdate)
      })
    },
    [instances, onRest, onKeyframesHalt, rest.ref, reverse]
  )

  // Update next frame is props aren't functional
  useEffect(() => void (!isFn && updateCtrl(props)))
  // Return animated props, or, anim-props + the update-setter above
  const propValues = instances.map(v => v.getValues())
  return isFn
    ? [
        propValues,
        updateCtrl,
        (finished = false) => instances.forEach(ctrl => ctrl.stop(finished)),
      ]
    : propValues
}

export const useSprings = useSpringsImpl()
