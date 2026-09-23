import { DocSearch } from '@docsearch/react'

import { memo } from 'react'
import { useRouteLoaderData } from 'react-router'

import type { loader } from '../../root'

export const WidgetSearch = memo(() => {
  const env = useRouteLoaderData<typeof loader>('root')?.ENV

  // DocSearch v5 throws without credentials, which would take down SSR
  if (!env?.ALGOLIA_APP_ID || !env.ALGOLIA_API_KEY) return null

  return (
    <DocSearch
      appId={env.ALGOLIA_APP_ID}
      indices={['react-spring_beta']}
      apiKey={env.ALGOLIA_API_KEY}
    />
  )
})
