import { Remap } from '@react-spring/types'
import { is } from '@react-spring/shared'

import { ControllerUpdate, PickAnimated, SpringValues } from '../types'
import { Valid } from '../types/common'
import { SpringRef } from '../SpringRef'
import { useSprings } from './useSprings'

/**
 * The props that `useSpring` recognizes.
 */
export type UseSpringProps<Props extends object = any> = unknown &
  PickAnimated<Props> extends infer State
  ? Remap<
      ControllerUpdate<State> & {
        /**
         * Used to access the imperative API.
         *
         * When defined, the render animation won't auto-start.
         */
        ref?: SpringRef<State>
      }
    >
  : never

/**
 * The `props` function is only called on the first render, unless
 * `deps` change (when defined). State is inferred from forward props.
 */
export function useSpring<Props extends object>(
  props:
    | Function
    | (() => (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps),
  deps?: readonly any[] | undefined
): PickAnimated<Props> extends infer State
  ? [SpringValues<State>, SpringRef<State>]
  : never

/**
 * Updated on every render, with state inferred from forward props.
 */
export function useSpring<Props extends object>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps
): SpringValues<PickAnimated<Props>>

/**
 * Updated only when `deps` change, with state inferred from forward props.
 */
export function useSpring<Props extends object>(
  props: (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps,
  deps: readonly any[] | undefined
): PickAnimated<Props> extends infer State
  ? [SpringValues<State>, SpringRef<State>]
  : never

/** @internal */
/**
 * 在钩子中使用spring，一般情况下props会使用一个对象来初始化spring，如下所示。
 * const [styles] = useSpring({opacity: 1, from: { opacity: 0 }})
 * 另一种不常用的使用方法为props传递一个函数，如下所示
 * const [styles, api] = useSpring(() => ({opacity: 0}))
 * // 开始动画到新的属性
 * api.start({opacity: 1})
 * @param props
 * @param deps
 * @returns
 */
export function useSpring(props: any, deps?: readonly any[]) {
  const isFn = is.fun(props) // porps是一个函数
  const [[values], ref] = useSprings(
    // 调用useSprings
    1,
    isFn ? props : [props], // 如果props是函数直接传递否则讲它包装在数组中
    isFn ? deps || [] : deps // 如果props是函数则传递deps，如果用户没有传递deps，则默认使用一个空[]
  )
  // 如果props为一个函数则此钩子的返回值为[values, ref]，否则为values
  return isFn || arguments.length == 2 ? [values, ref] : values
}
