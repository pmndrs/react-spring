import { Link } from 'remix'
import { styled } from '~/styles/stitches.config'
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
          '@tabletUp': {
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

const NavSection = styled('section')

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
})

const NavigationItem = ({
  label,
  href,
  description,
  comingSoon,
  isExternal,
}: Tile) => {
  const renderTile = () => (
    <Tile>
      <h2>{label}</h2>
      <p>{description}</p>
      {comingSoon ? (
        <span>Coming soon!</span>
      ) : (
        <Link to={href}>Read more</Link>
      )}
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

const Tile = styled('div', {
  position: 'relative',
  margin: 0,
  borderRadius: '$r8',
  zIndex: 0,
})
