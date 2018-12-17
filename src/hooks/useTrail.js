import React from 'react'
import Controller from '../animated/Controller'
import * as Globals from '../animated/Globals'
import { usePrevious } from '../shared/helpers'

export function useTrail (count, params) {
  const isFunctionProps = typeof params === 'function'
  const {
    delay,
    reverse,
    onKeyframesHalt = () => null,
    onRest,
    ...props
  } = isFunctionProps ? params() : params

  const mounted = React.useRef(false)
  const instances = React.useRef(!mounted.current && new Map([]))
  const endResolver = React.useRef()
  const [, forceUpdate] = React.useState()

  const onHalt = onRest
    ? ctrl => ({ finished }) => {
      finished && endResolver.current && endResolver.current()
      finished && mounted.current && onRest(ctrl.merged)
    }
    : onKeyframesHalt

  if (count > instances.current.size) {
    for (let i = instances.current.size; i < count; i++) {
      const attachedInstance = instances.current.get(i - 1)
      instances.current.set(
        i,
        new Controller({
          ...props,
          attach: attachedInstance && (() => attachedInstance)
        })
      )
    }
  }
  // console.log(previousReverse.current, reverse)

  const update = React.useCallback(
    /** resolve and last are passed to the update function from the keyframes controller */
    props => {
      // console.log(previousReverse.current, reverse, prevReverse)
      const instanceArray = Array.from(instances.current.entries()).sort(
        ([aIdx, bIdx]) => (reverse ? bIdx - aIdx : aIdx - bIdx)
      )

      for (let [idx, ctrl] of instanceArray) {
        const attachId = reverse ? idx + 1 : idx - 1
        const attachController = instances.current.get(attachId)
        ctrl.dependents.has(attachController) &&
          ctrl.dependents.delete(attachController),
        ctrl.update({
          ...props,
          attach: attachController && (() => attachController)
        })

        if (!props.ref) {
          ctrl.start(
            (reverse ? idx === 0 : instances.current.size - 1) && onHalt(ctrl)
          )
        }
      }
      Globals.requestFrame(() => props.reset && forceUpdate())
    },
    [onRest, reverse]
  )

  React.useImperativeMethods(props.ref, () => ({
    start: resolve => {
      endResolver.current = resolve
      for (let [idx, ctrl] of instances.current.entries()) {
        ctrl.start(
          (reverse ? idx === 0 : instances.current.size - 1) && onHalt(ctrl)
        )
      }
    },
    get isActive () {
      ;[...instances.current.values()].some(ctrl => ctrl.isActive)
    },
    stop: (finished = false) =>
      instances.current.forEach(([, ctrl]) => ctrl.stop(finished)),
    tag: 'TrailHook'
  }))

  /** must hoooks always return something? */
  React.useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  }, [])

  React.useEffect(() => void (!isFunctionProps && update(props)))

  const propValues = Array.from(instances.current.values()).map(ctrl =>
    ctrl.getValues()
  )

  return isFunctionProps
    ? [
      propValues,
      props => update(props),
      (finished = false) => {
        for (let [, ctrl] of instances.current.entries()) {
          ctrl.stop(finished)
        }
      }
    ]
    : propValues
}
