import { useSprings } from './useSprings'
import { is } from 'shared'

/** API
 * const [props, set, cancel] = useSpring(props, [optionalDeps])
 * const [props, set, cancel] = useSpring(() => props, [optionalDeps])
 */

export const useSpring = (props, deps) => {
  const isFn = is.fun(props)
  const [result, set, stop] = useSprings(1, isFn ? props : [props], deps)
  return [result[0], set, stop]
}
