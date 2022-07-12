import { ReactNode } from 'react'

import { styled } from '~/styles/stitches.config'

import { renderCell } from './TableCell'

export type CellData = string | null | { label: string; content: ReactNode }

interface TablesConfigurationProps {
  data?: CellData[][]
}

export const TablesConfiguration = ({
  data = DEFAULT_CONFIG_DATA,
}: TablesConfigurationProps) => (
  <Table>
    <thead>
      <tr>
        <TableHeadCell css={{ width: '40%', '@tabletUp': { width: '30%' } }}>
          Prop
        </TableHeadCell>
        <TableHeadCell css={{ width: '60%', '@tabletUp': { width: '50%' } }}>
          Type
        </TableHeadCell>
        <TableHeadCell css={{ '@tabletUp': { width: '20%' } }} isThirdItem>
          Default
        </TableHeadCell>
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>{row.map(renderCell())}</tr>
      ))}
    </tbody>
  </Table>
)

interface TableGenericProps extends TablesConfigurationProps {
  headData: string[]
}

export const TableGeneric = ({
  data = [],
  headData = [],
}: TableGenericProps) => (
  <Table>
    <thead>
      <tr>
        {headData.map(head =>
          head ? <TableHeadCell key={head}>{head}</TableHeadCell> : null
        )}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>{row.map(renderCell('generic'))}</tr>
      ))}
    </tbody>
  </Table>
)

export const TableScrollWrapper = styled('div', {
  width: '100%',
  overflow: 'scroll',
})

const Table = styled('table', {
  width: '100%',
  textAlign: 'left',
  borderCollapse: 'collapse',

  '& td, & th': {
    borderBottom: '2px solid $codeBackground',
  },
})

const TableHeadCell = styled('th', {
  fontFamily: '$sans-var',
  fontSize: '$XXS',
  lineHeight: '$XXS',
  py: '$15',

  variants: {
    isThirdItem: {
      true: {
        display: 'none',

        '@tabletUp': {
          display: 'table-cell',
        },
      },
    },
  },
})

export const DEFAULT_CONFIG_DATA: CellData[][] = [
  ['from', 'object', null],
  [
    'to',
    {
      label: 'object | object[] | function',
      content: (
        <code>{`(next: (props?: object) => Promise<void>, cancel: () => void) => Promise<void>`}</code>
      ),
    },
    null,
  ],
  [
    'loop',
    {
      label: 'boolean | object | function',
      content: <code>{`() => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'delay',
      content: <p>Delay in ms before the animation starts.</p>,
    },
    {
      label: 'number | function',
      content: <code>{`(key: string) => number`}</code>,
    },
    null,
  ],
  [
    {
      label: 'immediate',
      content: <p>Prevents the animation if true.</p>,
    },
    {
      label: 'boolean | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'reset',
      content: (
        <p>Resets the spring so it plays from the start again when true.</p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'reverse',
      content: (
        <p>
          Reverse the <code>to</code> and <code>from</code> prop so that{' '}
          <code>to</code> is the initial starting state.
        </p>
      ),
    },
    'boolean',
    null,
  ],
  [
    {
      label: 'pause',
      content: <p>Pause an animation at it's current point.</p>,
    },
    'boolean',
    null,
  ],
  [
    'cancel',
    {
      label: 'boolean | string | string[] | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    null,
  ],
  [
    {
      label: 'config',
      content: (
        <p>
          Spring config (mass / tension etc.), see{' '}
          <a href="/docs/advanced/config">Config</a> for more information.
        </p>
      ),
    },
    {
      label: 'object | function',
      content: <code>{`(key: string) => boolean`}</code>,
    },
    {
      label: 'object',
      content: <code>{`{ mass: 1, tension: 170, friction: 26 }`}</code>,
    },
  ],
  [
    {
      label: 'events',
      content: (
        <p>
          This is not a prop but rather a collection, see{' '}
          <a href="/docs/advanced/events">Events</a> for more information.
        </p>
      ),
    },
    'function',
    null,
  ],
]
