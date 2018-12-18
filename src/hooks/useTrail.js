import {
  useRef,
  useState,
  useMemo,
  useCallback,
  useImperativeMethods,
  useEffect
} from 'react'
import Ctrl from '../animated/Controller'
import { callProp } from '../shared/helpers'
import { requestFrame } from '../animated/Globals'

export function useTrail (length, args) {
  const [, forceUpdate] = useState()
  // Extract animation props and hook-specific props, can be a function or an obj
  const isFn = typeof args === 'function'
  const { config, reverse, onKeyframesHalt, onRest, ...props } = callProp(args)
  const isFnConfig = typeof config === 'function'
  // The controller maintains the animation values, starts and tops animations
  const instances = useMemo(
    () => {
      const instances = []
      for (let i = 0; i < length; i++) {
        instances.push(
          new Ctrl({
            ...props,
            attach: i > 0 && (() => instances[i - 1]),
            config: callProp(config, i)
          })
        )
      }
      return instances
    },
    [length]
  )
  // Define onEnd callbacks and resolvers
  const endResolver = useRef()
  const onHalt = onKeyframesHalt
    ? ctrl => ({ finished }) => {
      if (finished) {
        if (endResolver.current) endResolver.current()
        if (onRest) onRest(ctrl.merged)
      }
    }
    : onKeyframesHalt || (() => null)

  // The hooks explcit API gets defined here ...
  useImperativeMethods(props.ref, () => ({
    start: resolve => {
      endResolver.current = resolve
      instances.forEach(
        (ctrl, i) =>
          (reverse ? i === 0 : instances.current.size - 1) && onHalt(ctrl)
      )
    },
    get isActive () {
      ;[...instances.current.values()].some(ctrl => ctrl.isActive)
    },
    stop: (finished = false) =>
      instances.current.forEach(([, ctrl]) => ctrl.stop(finished)),
    tag: 'TrailHook'
  }))

  // Defines the hooks setter, which updates the controller
  const updateCtrl = useCallback(
    props => {
      instances.forEach((ctrl, i) => {
        const last = reverse ? i === 0 : instances.length - 1 === i
        const attachIdx = reverse ? i + 1 : i - 1
        const attachController = instances[attachIdx]
        ctrl.update({
          ...props,
          attach: attachController && (() => attachController)
        })

        if (!ctrl.props.ref) ctrl.start(last && onHalt(ctrl))
        if (last && ctrl.props.reset) requestFrame(forceUpdate)
      })
    },
    [instances, onRest, onKeyframesHalt, props.ref, reverse]
  )

  // Update next frame if props aren't functional
  useEffect(() => void (!isFn && updateCtrl(props)))
  // Return animated props, or, anim-props + the update-setter above
  const propValues = instances.map(v => v.getValues())
  return isFn
    ? [
      propValues,
      updateCtrl,
      (finished = false) => instances.forEach(ctrl => ctrl.stop(finished))
    ]
    : propValues
}
