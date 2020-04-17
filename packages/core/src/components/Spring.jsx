import { useSpring } from '../hooks'

export function Spring({ children, ...props }) {
  return children(useSpring(props))
}
