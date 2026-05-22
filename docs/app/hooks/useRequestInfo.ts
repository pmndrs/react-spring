import { useRouteLoaderData } from 'react-router'
import { loader } from '../root'
/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
  const data = useRouteLoaderData<typeof loader>('root')

  return data?.requestInfo
}
