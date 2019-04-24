import { useSprings } from './useSprings'
import { is } from './shared/helpers'

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

export const useSpring = (props, dependencies) => {
  const isFn = is.fun(props)
  const [result, set, stop] = useSprings(
    1,
    isFn ? props : [props],
    dependencies
  )
  return isFn ? [result[0], set, stop] : result
}
