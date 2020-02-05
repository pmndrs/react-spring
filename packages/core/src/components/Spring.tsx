import { NoInfer, UnknownProps } from '../types/common'
import { SpringValues, AsyncTo } from '../types/spring'
import { UseSpringProps, useSpring } from '../hooks/useSpring'

export type SpringComponentProps<
  State extends object = UnknownProps
> = unknown &
  UseSpringProps<State> & {
    children: (values: SpringValues<State>) => JSX.Element | null
  }

// Infer state from "from" object prop.
export function Spring<State extends object>(
  props: {
    from: State
    to?: AsyncTo<NoInfer<State>>
  } & Omit<SpringComponentProps<NoInfer<State>>, 'from' | 'to'>
): JSX.Element | null

// Infer state from "to" object prop.
export function Spring<State extends object>(
  props: { to: State } & Omit<SpringComponentProps<NoInfer<State>>, 'to'>
): JSX.Element | null

/**
 * The `Spring` component passes `SpringValue` objects to your render prop.
 */
export function Spring({ children, ...props }: any) {
  return children(useSpring(props))
}
