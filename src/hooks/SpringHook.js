import React from 'react'
import Controller from '../animated/Controller'
import * as Globals from '../animated/Globals'

export function useSpring (params) {
  const isFunctionProp = typeof params === 'function'
  const { onRest, onKeyframesHalt, ...props } = isFunctionProp
    ? params()
    : params
  const endResolver = React.useRef(null)
  const [ctrl] = React.useState(() => new Controller(props))
  const [, forceUpdate] = React.useState()
  const onHalt = onKeyframesHalt
    ? onKeyframesHalt(ctrl)
    : ({ finished }) => {
      finished && endResolver.current && endResolver.current()
      finished && onRest && onRest(ctrl.merged)
    }

  React.useImperativeMethods(props.ref, () => ({
    start: resolve => {
      endResolver.current = resolve
      ctrl.start(onHalt)
    },
    get isActive() {
      return ctrl.isActive
    },
    stop: (finished = false) => ctrl.stop(finished),
    tag: 'SpringHook'
  }))

  const update = React.useCallback(
    // resolve and last are passed to the update function from the keyframes controller
    animProps => {
      ctrl.update(animProps)
      if (!props.ref) {
        endResolver.current = null
        ctrl.start(onHalt)
      }
      Globals.requestFrame(() => animProps.reset && forceUpdate())
    },
    [onRest, onKeyframesHalt, props.ref]
  )

  React.useEffect(() => void (!isFunctionProp && update(props)))
  const propValues = ctrl.getValues()
  return isFunctionProp
    ? [
      propValues,
      props => update(props),
      (finished = false) => ctrl.stop(finished)
    ]
    : propValues
}
