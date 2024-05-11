import * as React from 'react'
import { SANDBOXES } from '~/data/sandboxes'

import { CodesandboxSandboxFetched, fetchSandbox } from '../helpers/sandboxes'

export const useCSB = (sandboxTitles: Array<keyof typeof SANDBOXES>) => {
  const [sandboxes, setSandboxes] = React.useState<CodesandboxSandboxFetched[]>(
    []
  )

  React.useEffect(() => {
    const fetchSandboxes = async () => {
      const sandboxIds = sandboxTitles.map(title => {
        return SANDBOXES[title]
      })

      const sandboxes = await Promise.all(sandboxIds.map(fetchSandbox)).then(
        boxes => boxes.sort((a, b) => a.title.localeCompare(b.title))
      )
      setSandboxes(sandboxes)
    }

    fetchSandboxes()
  }, [sandboxTitles])

  return sandboxes
}
