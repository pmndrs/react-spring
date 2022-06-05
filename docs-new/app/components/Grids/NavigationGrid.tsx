import { Link } from 'remix'
import { styled } from '~/styles/stitches.config'
import { Button } from '../Buttons/Button'
import { Copy } from '../Text/Copy'
import { Heading } from '../Text/Heading'

export interface Tile {
  href: string
  label: string
  description: string
  comingSoon?: boolean
  isExternal?: boolean
}

interface NavigationGridProps {
  tiles: Tile[]
  cols?: number
  subheading?: string
  heading?: string
}

export const NavigationGrid = ({
  tiles,
  cols = 2,
  subheading,
  heading,
}: NavigationGridProps) => {
  return (
    <NavSection>
      {subheading ? <Heading>{subheading}</Heading> : null}
      {heading ? <Heading>{heading}</Heading> : null}
      <Grid
        css={{
          '@desktopUp': {
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          },
        }}>
        {tiles.map(tile => (
          <NavigationItem key={tile.label} {...tile} />
        ))}
      </Grid>
    </NavSection>
  )
}

const NavSection = styled('section', {
  my: '$20',

  '@desktopUp': {
    my: '$40',
  },
})

const Grid = styled('div', {
  display: 'grid',
  gridRowGap: '$20',

  '@desktopUp': {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: '$40',
    gridRowGap: '$40',
  },
})

const NavigationItem = ({
  label,
  href,
  description,
  comingSoon = false,
  isExternal = false,
}: Tile) => {
  const canHover = Boolean(!comingSoon)

  const renderTile = () => (
    <Tile canHover={canHover}>
      <BackgroundTile />
      <Heading tag="h2" fontStyle="$S" weight="$semiblack">
        {label}
      </Heading>
      <TileCopy>{description}</TileCopy>
      <TileButton disabled={comingSoon}>
        {comingSoon ? <span>Coming soon!</span> : <span>Read more</span>}
      </TileButton>
    </Tile>
  )

  if (comingSoon) {
    return renderTile()
  }

  if (isExternal) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank">
        {renderTile()}
      </a>
    )
  }

  return <Link to={href}>{renderTile()}</Link>
}

const TileButton = styled(Button)

const BackgroundTile = styled('span', {
  display: 'block',
  position: 'absolute',
  inset: 0,
  background: '$redYellowGradient40',
  opacity: 0,
  transition: 'opacity 250ms ease-out',
  zIndex: '-1',
})

const Tile = styled('span', {
  position: 'relative',
  display: 'block',
  margin: 0,
  borderRadius: '$r8',
  zIndex: 0,
  backgroundColor: '$codeBackground',
  p: '$15 $20',
  overflow: 'hidden',
  transition: 'background-color 250ms ease-out',

  variants: {
    canHover: {
      true: {
        hover: {
          backgroundColor: 'transparent',

          [`& ${BackgroundTile}`]: {
            opacity: 1,
          },

          [`& ${TileButton}`]: {
            borderColor: '$red100',
          },
        },
      },
    },
  },
})

const TileCopy = styled(Copy, {
  mt: '$10',
  mb: '$20',
})
