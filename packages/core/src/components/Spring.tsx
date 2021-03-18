import { NoInfer, UnknownProps } from '@react-spring/types'
import { useSpring, UseSpringProps } from '../hooks/useSpring'
import { SpringValues, SpringToFn, SpringChain } from '../types'

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
    to?: SpringChain<NoInfer<State>> | SpringToFn<NoInfer<State>>
  } & Omit<SpringComponentProps<NoInfer<State>>, 'from' | 'to'>
): JSX.Element | null

// Infer state from "to" object prop.
export function Spring<State extends object>(
  props: { to: State } & Omit<SpringComponentProps<NoInfer<State>>, 'to'>
): JSX.Element | null

export function Spring({ children, ...props }: any) {
  return children(useSpring(props))
}
