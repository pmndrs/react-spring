import { ReactNode } from 'react'

import { DEFAULT_CONFIG_DATA } from '~/data/fixtures'

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
