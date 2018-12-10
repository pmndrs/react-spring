import React from 'react'
import Controller from '../animated/Controller'

export function useSpring({
  onRest,
  onKeyframesHalt = () => null,
  updatePropsOnRerender = true,
  ...props
}) {
  const [ctrl] = React.useState(new Controller(props))
  const onHalt = onRest
    ? ({ finished }) => finished && onRest(ctrl.merged)
    : onKeyframesHalt(ctrl)
  const update = React.useCallback(
    // resolve and last are passed to the update function from the keyframes controller
    animProps => ctrl.update(animProps, onHalt),
    [onRest, onKeyframesHalt]
  )

  React.useEffect(() => void (updatePropsOnRerender && update(props)))

  return [
    ctrl.getValues(),
    props => update(props),
    (finished = false) => ctrl.stop(finished),
  ]
}
