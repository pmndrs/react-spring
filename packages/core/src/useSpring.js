import { useSprings } from './useSprings'
import { is } from 'shared'

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

export const useSpring = (props, deps) => {
  const isFn = is.fun(props)
  const [result, set, stop] = useSprings(1, isFn ? props : [props], deps)
  return isFn ? [result[0], set, stop] : result
}
