import {
  useState,
  useRef,
  useImperativeMethods,
  useEffect,
  useCallback,
} from 'react'
import Ctrl from '../animated/Controller'
import { callProp } from '../shared/helpers'
import { requestFrame } from '../animated/Globals'

export function useSpring(args) {
  const [, forceUpdate] = useState()
  // Extract animation props and hook-specific props, can be a function or an obj
  const isFn = typeof args === 'function'
  const { onRest, onKeyframesHalt, ...props } = callProp(args)
  // The controller maintains the animation values, starts and tops animations
  const [ctrl] = useState(() => new Ctrl(props))
  useEffect(
    () => () => {
      console.log('sp')
      ctrl.destroy()
    },
    []
  )
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
    get isActive() {
      return ctrl.isActive
    },
    stop: (finished = false, resolve) => {
      ctrl.stop(finished)
      resolve && resolve()
    },
  }))

  // Defines the hooks setter, which updates the controller
  const updateCtrl = useCallback(
    updateProps => {
      ctrl.update(updateProps)
      if (!ctrl.props.ref) ctrl.start(onHalt)
      if (ctrl.props.reset) requestFrame(forceUpdate)
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
