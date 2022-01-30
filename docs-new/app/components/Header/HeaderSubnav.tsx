import { getFontStyles } from '~/styles/fontStyles'
import { styled } from '~/styles/stitches.config'
import { SubtitleSchemaItem } from '../../../scripts/docs/navigation'

interface HeaderSubnavProps {
  className?: string
  subnav: SubtitleSchemaItem
}

export const HeaderSubnav = ({ className, subnav }: HeaderSubnavProps) => {
  return (
    <SubNavContainer className={className}>
      <SubNavList>
        {subnav.map(({ href, label, id }) => (
          <SubNavListItem key={id}>
            <SubNavAnchor href={href}>{label}</SubNavAnchor>
          </SubNavListItem>
        ))}
      </SubNavList>
    </SubNavContainer>
  )
}

const SubNavContainer = styled('nav', {
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  my: '$30',
  px: '$25',
  overflow: '-moz-scrollbars-none',
  overflowX: 'auto',

  '&::-webkit-scrollbar': {
    display: 'none',
  },

  '@tabletUp': {
    justifyContent: 'center',
    px: '$50',
  },
})

const SubNavList = styled('ul', {
  listStyle: 'none',
  display: 'flex',
  margin: 0,
  padding: 0,
})

const SubNavListItem = styled('li', {
  mx: '$15',

  '&:first-child': {
    ml: 0,
  },

  '&:last-child': {
    mr: 0,
  },

  '@tabletUp': {
    mx: '$15',
  },
})

const SubNavAnchor = styled('a', {
  ...getFontStyles('$XXS'),
  whiteSpace: 'nowrap',
})
