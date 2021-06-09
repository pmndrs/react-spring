import { Valid } from '../types/common'
import { TransitionComponentProps } from '../types'
import { useTransitions } from '../hooks'

export function Transition<
  Item extends any,
  Props extends TransitionComponentProps<Item>
>(
  props:
    | TransitionComponentProps<Item>
    | (Props & Valid<Props, TransitionComponentProps<Item, Props>>)
): JSX.Element

export function Transition({
  items,
  children,
  ...props
}: TransitionComponentProps<any>) {
  return useTransitions(items, props)(children)
}
