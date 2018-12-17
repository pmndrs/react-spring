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
  const isFn = typeof args === 'function'
  const { onRest, onKeyframesHalt, ...props } = isFn ? args() : args
  const [ctrl] = useState(() => new Controller(props))
  const endResolver = useRef(null)
  const [, forceUpdate] = useState()
  const onHalt = onKeyframesHalt
    ? onKeyframesHalt(ctrl)
    : ({ finished }) => {
        if (finished) {
          if (endResolver.current) endResolver.current()
          if (onRest) onRest(ctrl.merged)
        }
      }

  useImperativeMethods(props.ref, () => ({
    start: resolve =>
      void ((endResolver.current = resolve), ctrl.start(onHalt)),
  }))

  const updateCtrl = useCallback(
    updateProps => {
      ctrl.update(updateProps)
      if (!props.ref) {
        endResolver.current = null
        ctrl.start(onHalt)
      }
      if (props.reset) requestFrame(forceUpdate)
    },
    [onRest, onKeyframesHalt, props.ref]
  )

  useEffect(() => void (!isFn && updateCtrl(props)))
  const propValues = ctrl.getValues()
  return isFn
    ? [propValues, updateCtrl, (finished = false) => ctrl.stop(finished)]
    : propValues
}
