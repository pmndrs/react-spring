import {
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react'
import Ctrl from '../animated/Controller'
import { callProp } from '../shared/helpers'
import { requestFrame } from '../animated/Globals'
import KCtrl from '../animated/KeyframeController'

export const useSpringImpl = (type = 'default') => args => {
  const [, forceUpdate] = useState()
  // Extract animation props and hook-specific props, can be a function or an obj
  const isFn = typeof args === 'function'
  const { onRest, onKeyframesHalt, ...props } = callProp(args)
  // The controller maintains the animation values, starts and tops animations
  const [ctrl] = useState(() =>
    type === 'keyframe' ? new KCtrl(props) : new Ctrl(props)
  )
  // Destroy controller on unmount
  useEffect(() => () => ctrl.destroy(), [])

  const onHalt = ({ finished }) => finished && onRest && onRest(ctrl.merged)

  // The hooks explcit API gets defined here ...
  useImperativeHandle(props.ref, () => ({
    start: () => ctrl.start(onHalt),
    get isActive() {
      return ctrl.isActive
    },
    stop: (finished = false) => {
      if (ctrl.isActive) ctrl.stop(finished)
    },
  }))

  // Defines the hooks setter, which updates the controller
  const updateCtrl = useCallback(
    updateProps => {
      type === 'keyframe'
        ? ctrl.updateWithForceUpdate(forceUpdate, updateProps)
        : ctrl.update(updateProps)
      if (!ctrl.props.ref) ctrl.start(onHalt)
      if (ctrl.props.reset && type === 'default') requestFrame(forceUpdate)
    },
    [onRest, ctrl.props.ref]
  )

  // Update next frame is props aren't functional
  useEffect(() => void (!isFn && updateCtrl(props)))
  // Return animated props, or, anim-props + the update-setter above
  const propValues = ctrl.getValues()
  return isFn
    ? [propValues, updateCtrl, (finished = false) => ctrl.stop(finished)]
    : propValues
}

export const useSpring = useSpringImpl()
