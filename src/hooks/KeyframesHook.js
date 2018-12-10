import React from 'react'
import * as Globals from '../animated/Globals'
import { useSpring } from './SpringHook'
import { useTrail } from './TrailHook'
import { callProp } from '../shared/helpers'

export function parseKeyframedUpdate (slots, config, f, setNext, cancel) {
  if (Array.isArray(slots)) {
    let q = Promise.resolve()
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      const last = i === slots.length - 1
      const config = Array.isArray(config) ? config[i] : config
      q = q.then(() => setNext({ config, ...f(slot) }, last))
    }
  } else if (typeof slots === 'function') {
    let index = 0
    slots(
      (animatedProps, last = false) => {
        const props = { config: Array.isArray(config) ? config[index++] : config,  ...f(animatedProps)}
        return  setNext(props, last)
      },
      (finished = true) =>
        cancel && cancel(finished)
    )
  } else {
    const last = true
    const config = Array.isArray(config) ? config[0] : config
    setNext({config, ...f(slots)}, last)
  }
}

export function onKeyframesHalt ({ resolverRef, lastRef, mounted, onRestRef }) {
  return function (ctrl) {
    return function ({ finished }) {
      resolverRef.current && resolverRef.current()
      const merged = ctrl && ctrl.merged
      const { onRest, onKeyframeRest } = onRestRef.current
      if (finished && lastRef.current && mounted.current) {
        onKeyframeRest && onKeyframeRest(merged)
        onRest && onRest(merged)
      }
    }
  }
}

export function setNext (
  resolverRef = { current: null },
  lastRef = { current: null },
  setAnimation,
  onRestRef = { current: { onKeyframeRest: null } },
  shouldForceUpdateRef = { current: false },
  forceUpdate
) {
  return function (props, last) {
    return new Promise(resolve => {
      const { onRest, ...animatedProps } = props || {}
      onRestRef.current.onKeyframeRest = onRest
      resolverRef.current = resolve
      lastRef.current = last
      setAnimation && setAnimation(animatedProps)
      shouldForceUpdateRef.current &&
        Globals.requestFrame(() => {
          shouldForceUpdateRef.current = false
          forceUpdate()
        })
    })
  }
}

/**
 * TODO: possible API draft
 *
 * Functional, no slot name needed
 *  const props = useKeyframes.Spring(async next => { ... })
 *
 * Arrays, no slot name needed
 *  const props = useKeyframes.Spring([{ ... }, { ... }])
 *
 * Named slots, slot name mandatory
 *  const props = useKeyframes.Spring({
 *    arrays: [{ ... }, { ... }],
 *    functions: async next => { ... }
 *    values: { ... }
 *  }, slotName)
 *
 * Using it
 *  return (
 *    <animated.div style={props}>{content}</animated.div>
 *  )
 */

/**
 *
 * @param {(useSpring | useTrail)} useImpl
 * @param {Object} props
 * @param {Array=} props.items // only needed when using Trail primitive
 * @param {Object} props.states
 * @param {Function} props.filter
 * @param {SpringProps} ...props
 * @param {String} state
 * @param {SpringProps} initialProps
 */
const useKeyframesImpl = useImpl => (
  props,
  state = '__default',
  initialProps = null
) => {
  const resolverRef = React.useRef(null)
  const onRestRef = React.useRef({ onRest: null, onKeyframeRest: null })
  const lastRef = React.useRef(true)
  const mounted = React.useRef(false)

  // need to force a rerender for when the
  // animated controller has finally accepted
  // some props

  const [, forceUpdate] = React.useState()
  const shouldForceUpdateRef = React.useRef(!initialProps)

  const {
    states,
    config,
    filter = states => states,
    ...restProps
  } = (function () {
    if (Array.isArray(props) || typeof props === 'function') {
      return { states: { [state]: props } }
    } else {
      const { onRest, ...rest } = props
      onRestRef.current.onRest = onRest
      return rest
    }
  })()

  const [animProps, setAnimation, cancel] = useImpl({
    ...initialProps,
    ...restProps,
    onKeyframesHalt: onKeyframesHalt({
      resolverRef,
      lastRef,
      mounted,
      onRestRef
    }),
    updatePropsOnRerender: false
  })

  const setNextKeyFrame = setNext(
    resolverRef,
    lastRef,
    setAnimation,
    onRestRef,
    shouldForceUpdateRef,
    forceUpdate
  )
  React.useEffect(() => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])

  React.useEffect(
    () => {
      void (
        mounted.current &&
        parseKeyframedUpdate(
          states[state],
          callProp(config, state),
          filter,
          setNextKeyFrame,
          cancel
        )
      )
    },
    [state]
  )
  return shouldForceUpdateRef.current && Array.isArray(animProps)
    ? []
    : animProps
}

export const useKeyframes = {
  Spring: useKeyframesImpl(useSpring),
  Trail: useKeyframesImpl(useTrail),
}
