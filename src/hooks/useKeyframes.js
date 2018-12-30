import React from 'react'
import { useSpringImpl } from './useSpring'
import { useSpringsImpl } from './useSprings'
import { callProp } from '../shared/helpers'
import * as Globals from '../animated/Globals'

/**
 *
 * @param {(useSpring | useTrail)} useImpl
 * @param {Object} props
 * @param {Array=} props.items // only needed when using Trail primitive
 * @param {Object} props.states
 * @param {SpringProps} ...props
 * @param {String} state
 * @param {SpringProps} initialProps
 */
const useKeyframesImpl = useImpl => (props, initialProps = null) => (
  ...params
) => {
  const mounted = React.useRef(false)
  const [state = 'default', count] =
    params.length === 2 ? params.reduceRight((a, b) => [a, b]) : params

  // need to force a rerender for when the animated controller has finally accepted props
  const [, forceUpdate] = React.useState()
  const shouldForceUpdateRef = React.useRef(!initialProps)

  const { states, config, onRest } = (function() {
    if (Array.isArray(props) || typeof props === 'function') {
      return { states: { [state]: props } }
    } else {
      const { onRest, config, ...rest } = props
      return { states: rest, config, onRest }
    }
  })()

  const calculatedProps = () => ({
    ...initialProps,
    native: true,
    onRest,
    config,
  })

  const args =
    typeof count === 'number' ? [count, calculatedProps] : [calculatedProps]

  const [animProps, setAnimation, cancel] = useImpl(...args)

  React.useEffect(() => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])

  React.useEffect(
    () => {
      shouldForceUpdateRef.current && forceUpdate()
      shouldForceUpdateRef.current = false
      setAnimation(states[state])
    },
    [state]
  )

  return shouldForceUpdateRef.current && Array.isArray(animProps)
    ? []
    : animProps
}

export const useKeyframes = {
  spring: (...args) => useKeyframesImpl(useSpringImpl('keyframe'))(...args),
  springs: (...args) => useKeyframesImpl(useSpringsImpl('keyframe'))(...args),
  trail: (...args) =>
    useKeyframesImpl(useSpringsImpl('keyframe', true))(...args),
}
