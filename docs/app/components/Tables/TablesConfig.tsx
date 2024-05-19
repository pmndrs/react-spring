import { ReactNode } from 'react'

import { DEFAULT_CONFIG_DATA } from '~/data/fixtures'

import { renderCell } from './TableCell'
import {
  firstTableCell,
  secondTableCell,
  table,
  tableHeadCell,
  thirdTableCell,
} from './TablesConfig.css'
import clsx from 'clsx'

export type CellData = string | null | { label: string; content: ReactNode }

interface TablesConfigurationProps {
  data?: CellData[][]
}

export const TablesConfiguration = ({
  data = DEFAULT_CONFIG_DATA,
}: TablesConfigurationProps) => (
  <table className={table}>
    <thead>
      <tr>
        <th className={clsx(tableHeadCell, firstTableCell)}>Prop</th>
        <th className={clsx(tableHeadCell, secondTableCell)}>Type</th>
        <th className={clsx(tableHeadCell, thirdTableCell)}>Default</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>{row.map(renderCell())}</tr>
      ))}
    </tbody>
  </table>
)

interface TableGenericProps extends TablesConfigurationProps {
  headData: string[]
}

export const TableGeneric = ({
  data = [],
  headData = [],
}: TableGenericProps) => (
  <table className={table}>
    <thead>
      <tr>
        {headData.map(head =>
          head ? (
            <th className={tableHeadCell} key={head}>
              {head}
            </th>
          ) : null
        )}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>{row.map(renderCell('generic'))}</tr>
      ))}
    </tbody>
  </table>
)
