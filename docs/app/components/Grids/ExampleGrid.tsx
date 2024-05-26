import { CardExample } from '~/components/Cards/CardExample'
import { SANDBOXES } from '~/data/sandboxes'

import { useCSB } from '~/hooks/useCSB'
import { exampleGridRoot } from './ExampleGrid.css'

interface ExampleGridProps {
  sandboxTitles: Array<keyof typeof SANDBOXES>
}

export const ExampleGrid = ({ sandboxTitles }: ExampleGridProps) => {
  const sandboxes = useCSB(sandboxTitles)

  return (
    <ul className={exampleGridRoot}>
      {sandboxes.map(sandbox => (
        <li key={sandbox.id}>
          <CardExample {...sandbox} />
        </li>
      ))}
    </ul>
  )
}
