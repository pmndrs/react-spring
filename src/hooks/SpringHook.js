import React from 'react'
import Controller from '../animated/Controller'
import * as Globals from '../animated/Globals'

export function useSpring (params) {
  const isFunctionProp = typeof params === 'function'
  const { onRest, onKeyframesHalt = () => null, ...props } = isFunctionProp
    ? params()
    : params
  const [ctrl] = React.useState(() => new Controller(props))
  const [, forceUpdate] = React.useState()
  const onHalt = onRest
    ? ({ finished }) => finished && onRest(ctrl.merged)
    : onKeyframesHalt(ctrl)

  const update = React.useCallback(
    // resolve and last are passed to the update function from the keyframes controller
    animProps => {
      ctrl.update(animProps, onHalt)
      Globals.requestFrame(() => animProps.reset && forceUpdate())
    },
    [onRest, onKeyframesHalt]
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
