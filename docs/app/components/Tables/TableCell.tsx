import * as Popover from '@radix-ui/react-popover'
import { Info } from 'phosphor-react'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

import type { CellData } from './TablesConfig'
import {
  popoverArrow,
  popoverBaseContent,
  popoverContent,
  popoverTrigger,
  tableCell,
  tableCellIsPropName,
  tableCellIsThirdItem,
} from './TableCell.css'
import clsx from 'clsx'

export const renderCell =
  (template: 'config' | 'generic' = 'config') =>
  (datum: CellData, index: number) => {
    const isDarkMode = useIsDarkTheme()

    if (datum === null) {
      return (
        <td
          className={clsx(
            tableCell,
            template === 'config' && index === 2 && tableCellIsThirdItem
          )}
          key={`${datum}_${index}`}
        >
          {'–'}
        </td>
      )
    }

    if (typeof datum === 'object') {
      return (
        <Popover.Root>
          <td
            className={clsx(
              tableCell,
              template === 'config' && index === 0 && tableCellIsPropName,
              template === 'config' && index === 2 && tableCellIsThirdItem
            )}
          >
            <code>{datum.label}</code>
            <Popover.Trigger className={popoverTrigger}>
              <Info size={16} weight={isDarkMode ? 'light' : 'regular'} />
            </Popover.Trigger>
            <Popover.Content
              className={clsx(
                popoverBaseContent,
                popoverContent({
                  isProp: index === 0,
                })
              )}
              onOpenAutoFocus={e => e.preventDefault()}
              side="top"
              sideOffset={10}
            >
              {datum.content}
              <Popover.Arrow className={popoverArrow} />
            </Popover.Content>
          </td>
        </Popover.Root>
      )
    }

    return (
      <td
        key={datum}
        className={clsx(
          tableCell,
          template === 'config' && index === 0 && tableCellIsPropName,
          template === 'config' && index === 2 && tableCellIsThirdItem
        )}
      >
        <code>{datum}</code>
      </td>
    )
  }
