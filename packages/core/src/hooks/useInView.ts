import { MutableRefObject, useRef, useState } from 'react'
import { is, useIsomorphicLayoutEffect } from '@react-spring/shared'
import { Lookup } from '@react-spring/types'

import { PickAnimated, SpringValues } from '../types'
import { useSpring, UseSpringProps } from './useSpring'

export interface IntersectionArgs
  extends Omit<IntersectionObserverInit, 'root' | 'threshold'> {
  root?: React.MutableRefObject<HTMLElement>
  once?: boolean
  amount?: 'any' | 'all' | number
}

const defaultThresholdOptions = {
  any: 0,
  all: 1,
}

export function useInView<TElement extends HTMLElement>(
  args?: IntersectionArgs
): [React.MutableRefObject<TElement>, boolean]
export function useInView<Props extends object, TElement extends HTMLElement>(
  props: () => UseSpringProps<any>,
  args?: IntersectionArgs
): PickAnimated<Props> extends infer State
  ? State extends Lookup
    ? [MutableRefObject<TElement>, SpringValues<State>]
    : never
  : never
export function useInView<TElement extends HTMLElement>(
  props?: (() => UseSpringProps<any>) | IntersectionArgs,
  args?: IntersectionArgs
) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<TElement>()

  const propsFn = is.fun(props) && props

  const springsProps = propsFn ? propsFn() : {}
  const { to = {}, from = {}, ...restSpringProps } = springsProps

  const intersectionArguments = propsFn ? args : (propsFn as IntersectionArgs)

  const [springs, api] = useSpring(() => ({ from, ...restSpringProps }), [])

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    const {
      root,
      once,
      amount = 'any',
      ...restArgs
    } = intersectionArguments ?? {}

    if (
      !element ||
      (once && isInView) ||
      typeof IntersectionObserver === 'undefined'
    )
      return

    const activeIntersections = new WeakMap<Element, VoidFunction>()

    const onEnter = () => {
      if (to) {
        api.start(to)
      }

      setIsInView(true)

      const cleanup = () => {
        if (from) {
          api.start(from)
        }
        setIsInView(false)
      }

      return once ? undefined : cleanup
    }

    const handleIntersection: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        const onLeave = activeIntersections.get(entry.target)

        if (entry.isIntersecting === Boolean(onLeave)) {
          return
        }

        if (entry.isIntersecting) {
          const newOnLeave = onEnter()
          if (is.fun(newOnLeave)) {
            activeIntersections.set(entry.target, newOnLeave)
          } else {
            observer.unobserve(entry.target)
          }
        } else if (onLeave) {
          onLeave()
          activeIntersections.delete(entry.target)
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: (root && root.current) || undefined,
      threshold:
        typeof amount === 'number' ? amount : defaultThresholdOptions[amount],
      ...restArgs,
    })

    observer.observe(element)

    return () => observer.unobserve(element)
  }, [intersectionArguments])

  if (propsFn) {
    return [ref, springs]
  }

  return [ref, isInView]
}
