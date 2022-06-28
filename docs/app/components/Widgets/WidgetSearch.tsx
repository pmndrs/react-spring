import { DocSearch } from '@docsearch/react'

export const WidgetSearch = () => {
  return (
    <DocSearch
      appId={typeof window === 'undefined' ? '' : window.env.ALGOLIA_APP_ID}
      indexName="react-spring"
      apiKey={typeof window === 'undefined' ? '' : window.env.ALGOLIA_API_KEY}
    />
  )
}
