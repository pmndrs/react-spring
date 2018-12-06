import React from 'react'
import * as Globals from '../animated/Globals'
import { useSpring } from './SpringHook'
import { useTrail } from './TrailHook'
import { callProp } from '../shared/helpers'

export function parseKeyframedUpdate (slots, f, setNext, cancel) {
  if (Array.isArray(slots)) {
    let q = Promise.resolve()
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      const last = i === slots.length - 1
      q = q.then(() => setNext(f(slot), last))
    }
  } else if (typeof slots === 'function') {
    slots(
      (animatedProps, last = false) => setNext(f(animatedProps), last),
      (finished = false) => Globals.requestFrame(() => cancel && cancel(finished))
    )
  } else {
    const last = true
    setNext(f(slots), last)
  }
}

export function onKeyframesHalt (resolverRef, lastRef, mounted, onRest) {
  return function (ctrl) {
    return function ({ finished }) {
      resolverRef.current && resolverRef.current()
      const merged = ctrl && ctrl.merged
      finished && lastRef.current && mounted.current && onRest && onRest(merged)
    }
  }
}

export function setNext (
  resolverRef = { current: null },
  lastRef = { current: null },
  updater
) {
  return function (animatedProps, last) {
    return new Promise(resolve => {
      resolverRef.current = resolve
      lastRef.current = last
      updater && updater(animatedProps)
    })
  }
}

// pass props and initial Value
export function useSpringKeyframes (
  { onRest, state, states, filter = states => states, ...props },
  initialProps
) {
  const resolverRef = React.useRef(null)
  const lastRef = React.useRef(true)
  const mounted = React.useRef(false)

  const [styles, setSpring, cancelSpring] = useSpring({
    ...initialProps,
    ...props,
    onKeyframesHalt: onKeyframesHalt(resolverRef, lastRef, mounted, onRest),
    updatePropsOnRerender: false
  })

  const setNextKeyFrame = setNext(resolverRef, lastRef, setSpring)
  React.useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  }, [])

  React.useEffect(
    () => {
      if (mounted.current) {
        const slots = states[state]
        parseKeyframedUpdate(slots, filter, setNextKeyFrame, cancelSpring)
      }
    },
    [state]
  )

  return styles
}

export function useTrailKeyframes (
  { onRest, state, states, filter = states => states, ...props },
  initialProps
) {
  const resolverRef = React.useRef(null)
  const lastRef = React.useRef(true)
  const mounted = React.useRef(false)

  const [items, setTrail, cancelTrail] = useTrail({
    ...props,
    ...initialProps,
    onKeyframesHalt: onKeyframesHalt(resolverRef, lastRef, mounted, onRest),
    updatePropsOnRerender: false
  })

  const setNextKeyFrame = setNext(resolverRef, lastRef, setTrail)

  React.useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  })

  React.useEffect(
    () => {
      if (mounted.current) {
        const slots = states[state]
        parseKeyframedUpdate(slots, filter, setNextKeyFrame, cancelTrail)
      }
    },
    [state]
  )

  return items
}
