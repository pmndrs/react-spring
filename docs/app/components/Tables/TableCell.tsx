import * as Popover from '@radix-ui/react-popover'
import { Info } from 'phosphor-react'

import { styled } from '~/styles/stitches.config'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

import { InlineLinkStyles } from '~/components/InlineLink'

import type { CellData } from './TablesConfig'

export const renderCell =
  (template: 'config' | 'generic' = 'config') =>
  (datum: CellData, index: number) => {
    const isDarkMode = useIsDarkTheme()

    if (datum === null) {
      return (
        <TableCell
          key={`${datum}_${index}`}
          isThirdItem={template === 'config' ? index === 2 : false}>
          {'–'}
        </TableCell>
      )
    }

    if (typeof datum === 'object') {
      return (
        <Popover.Root>
          <TableCell
            isPropName={template === 'config' ? index === 0 : false}
            isThirdItem={template === 'config' ? index === 2 : false}>
            <code>{datum.label}</code>
            <PopoverTrigger>
              <Info size={16} weight={isDarkMode ? 'light' : 'regular'} />
            </PopoverTrigger>
            <PopoverContent
              onOpenAutoFocus={e => e.preventDefault()}
              side="top"
              sideOffset={10}
              isProp={index === 0}>
              {datum.content}
              <PopoverArrow />
            </PopoverContent>
          </TableCell>
        </Popover.Root>
      )
    }

    return (
      <TableCell
        key={datum}
        isPropName={template === 'config' ? index === 0 : false}
        isThirdItem={template === 'config' ? index === 2 : false}>
        <code>{datum}</code>
      </TableCell>
    )
  }

const TableCell = styled('td', {
  fontFamily: '$mono',
  fontSize: '$XS',
  lineHeight: '$XS',
  py: '$15',
  pr: '$10',

  '& > code': {
    borderRadius: '$r4',
    py: 2,
    px: 5,
  },

  variants: {
    isPropName: {
      true: {
        '& > code': {
          backgroundColor: '#ff6d6d33',
          color: '$red100',
        },
      },
      false: {
        '& > code': {
          backgroundColor: '$steel20',
          color: '$steel40',
        },
      },
    },
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

const PopoverTrigger = styled(Popover.Trigger, {
  background: 'transparent',
  border: 'none',
  p: 0,
  m: 0,
  ml: '$5',
  cursor: 'pointer',
  width: 24,
  height: 24,
  borderRadius: '$r4',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  top: 3,

  hover: {
    background: '#ff6d6d66',
  },
})

const PopoverArrow = styled(Popover.Arrow, {
  fill: '$codeBackground',
})

const PopoverContent = styled(Popover.Content, {
  fontFamily: '$sans-var',
  fontSize: '$XXS',
  lineHeight: '$XXS',
  p: '$10 $15',
  background: '$codeBackground',
  borderRadius: '$r8',

  '& > code': {
    borderRadius: '$r4',
    py: 2,
    px: 5,
    whiteSpace: 'nowrap',
  },

  '& a': { ...InlineLinkStyles },

  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',

  variants: {
    isProp: {
      true: {
        maxWidth: 265,
      },
      false: {
        maxWidth: 400,
        overflow: 'scroll',
      },
    },
  },
})
