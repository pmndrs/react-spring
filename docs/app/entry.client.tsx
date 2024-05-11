import { RemixBrowser } from '@remix-run/react'
import * as React from 'react'
import { hydrateRoot } from 'react-dom/client'

import { ClientStyleContext } from '~/styles/client.context'
import { getCssText } from '~/styles/stitches.config'

interface ClientCacheProviderProps {
  children: React.ReactNode
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [sheet, setSheet] = React.useState(getCssText())

  const reset = React.useCallback(() => {
    setSheet(getCssText())
  }, [])

  return (
    <ClientStyleContext.Provider value={{ reset, sheet }}>
      {children}
    </ClientStyleContext.Provider>
  )
}

hydrateRoot(
  document,
  <ClientCacheProvider>
    <RemixBrowser />
  </ClientCacheProvider>
)
