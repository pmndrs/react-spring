import { CardExample } from '~/components/Cards/CardExample'
import { SANDBOXES } from '~/data/sandboxes'

import { useCSB } from '~/hooks/useCSB'

import { styled } from '~/styles/stitches.config'

interface ExampleGridProps {
  sandboxTitles: Array<keyof typeof SANDBOXES>
}

export const ExampleGrid = ({ sandboxTitles }: ExampleGridProps) => {
  const sandboxes = useCSB(sandboxTitles)

  return (
    <ExampleGridRoot>
      {sandboxes.map(sandbox => (
        <ExampleGridItem key={sandbox.id}>
          <CardExample {...sandbox} />
        </ExampleGridItem>
      ))}
    </ExampleGridRoot>
  )
}

const ExampleGridRoot = styled('ul', {
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridColumnGap: '20px',
  gridRowGap: '20px',
  margin: 0,
  padding: 0,
  mb: '$30',
})

const ExampleGridItem = styled('li', {})
