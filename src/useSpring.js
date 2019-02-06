import { useSprings } from './useSprings'
import { is } from './shared/helpers'

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

export const useSpring = props => {
  const isFn = is.fun(props)
  const [result, set] = useSprings(1, isFn ? props : [props])
  return isFn ? [result[0], set] : result
}
