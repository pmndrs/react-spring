import pkg from '@docsearch/react'
const { DocSearch } = pkg

import { memo } from 'react'

export const WidgetSearch = memo(() => {
  return (
    <DocSearch
      appId={typeof window === 'undefined' ? '' : window.env.ALGOLIA_APP_ID}
      indexName="react-spring_beta"
      apiKey={typeof window === 'undefined' ? '' : window.env.ALGOLIA_API_KEY}
    />
  )
})
