import { useSprings } from './useSprings'
import { is } from 'shared'

/** API
 * const [props, update, stop] = useSpring(props, [optionalDeps])
 * const [props, update, stop] = useSpring(() => props, [optionalDeps])
 */

export const useSpring = (props, deps) => {
  const isFn = is.fun(props)
  const [result, update, stop] = useSprings(1, isFn ? props : [props], deps)
  return [result[0], update, stop]
}
