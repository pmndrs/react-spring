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
  justifyContent: 'center',
  //   border: 'solid 1px $grey',
  //   borderLeft: 'none',
  //   borderRight: 'none',
  mt: '$15',
  py: '$10',
})

const SubNavList = styled('ul', {
  listStyle: 'none',
  display: 'flex',
  margin: 0,
  padding: 0,
})

const SubNavListItem = styled('li', {
  mx: '$15',
})

const SubNavAnchor = styled('a', {
  ...getFontStyles('$XXS'),
})
