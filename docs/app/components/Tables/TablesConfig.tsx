import { ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Info } from 'phosphor-react'

import { styled } from '~/styles/stitches.config'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

import { InlineLinkStyles } from '~/components/InlineLink'

type CellData = string | null | { label: string; content: ReactNode }

export const TablesConfiguration = () => (
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
      {DEFAULT_CONFIG_DATA.map((row, index) => (
        <tr key={index}>{row.map(renderCell)}</tr>
      ))}
    </tbody>
  </Table>
)

const renderCell = (datum: CellData, index: number) => {
  const isDarkMode = useIsDarkTheme()

  if (datum === null) {
    return (
      <TableCell key={`${datum}_${index}`} isThirdItem={index === 2}>
        {'–'}
      </TableCell>
    )
  }

  if (typeof datum === 'object') {
    return (
      <Popover.Root>
        <TableCell isPropName={index === 0} isThirdItem={index === 2}>
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
    <TableCell key={datum} isPropName={index === 0} isThirdItem={index === 2}>
      <code>{datum}</code>
    </TableCell>
  )
}

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

const DEFAULT_CONFIG_DATA: CellData[][] = [
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
          Reverse the `to` and `from` prop so that `to` is the initial starting
          state.
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
