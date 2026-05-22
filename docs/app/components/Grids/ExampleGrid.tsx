import { useMemo } from 'react'
import { CardExample } from '~/components/Cards/CardExample'
import { sandboxesByTitle } from '~/data/sandboxes'

import { exampleGridRoot } from './ExampleGrid.css'

interface ExampleGridProps {
  sandboxTitles: string[]
}

export const ExampleGrid = ({ sandboxTitles }: ExampleGridProps) => {
  const sandboxes = useMemo(() => {
    const byTitle = sandboxesByTitle()
    return sandboxTitles
      .map(title => byTitle[title])
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  }, [sandboxTitles])

  return (
    <ul className={exampleGridRoot}>
      {sandboxes.map(sandbox => (
        <li key={sandbox.slug}>
          <CardExample {...sandbox} />
        </li>
      ))}
    </ul>
  )
}
