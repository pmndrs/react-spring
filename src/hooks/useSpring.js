import React, {
  useState,
  useRef,
  useImperativeMethods,
  useEffect,
  useCallback,
} from 'react'
import Controller from '../animated/Controller'
import { requestFrame } from '../animated/Globals'

export function useSpring(args) {
  const [, forceUpdate] = useState()
  // Extract animation props and hook-specific props, can be a function or an obj
  const isFn = typeof args === 'function'
  const { onRest, onKeyframesHalt, ...props } = isFn ? args() : args
  // The controller maintains the animation values, starts and tops animations
  const [ctrl] = useState(() => new Controller(props))
  // Define onEnd callbacks and resolvers
  const endResolver = useRef(null)
  const onHalt = onKeyframesHalt
    ? onKeyframesHalt(ctrl)
    : ({ finished }) => {
        if (finished) {
          if (endResolver.current) endResolver.current()
          if (onRest) onRest(ctrl.merged)
        }
      }

  // The hooks explcit API gets defined here ...
  useImperativeMethods(props.ref, () => ({
    start: resolve =>
      void ((endResolver.current = resolve), ctrl.start(onHalt)),
  }))

  // Defines the hooks setter, which updates the controller
  const updateCtrl = useCallback(
    updateProps => {
      ctrl.update(updateProps)
      if (!props.ref) ctrl.start(onHalt)
      if (props.reset) requestFrame(forceUpdate)
    },
    [onRest, onKeyframesHalt, props.ref]
  )
  
  // Update next frame is props aren't functional
  useEffect(() => void (!isFn && updateCtrl(props)))
  // Return animated props, or, anim-props + the update-setter above
  const propValues = ctrl.getValues()
  return isFn
    ? [propValues, updateCtrl, (finished = false) => ctrl.stop(finished)]
    : propValues
}
