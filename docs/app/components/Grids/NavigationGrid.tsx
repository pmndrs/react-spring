import { IconProps } from 'phosphor-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { Link } from '@remix-run/react'
import { isStringGuard } from '~/helpers/guards'
import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'
import { dark, styled } from '~/styles/stitches.config'
import { Button } from '../Buttons/Button'
import { Copy } from '../Text/Copy'
import { GradiantHeader } from '../Text/GradientHeader'
import { Heading } from '../Text/Heading'

export interface Tile {
  href: string
  label: string
  description: string
  comingSoon?: boolean
  isExternal?: boolean
  Icon?:
    | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
    | string
}

interface NavigationGridProps {
  tiles: Tile[]
  cols?: number
  subheading?: string
  heading?: string
  smallTiles?: boolean
  className?: string
}

export const NavigationGrid = ({
  tiles,
  cols = 2,
  subheading,
  heading,
  smallTiles = false,
  className,
}: NavigationGridProps) => {
  return (
    <NavSection className={className}>
      {subheading ? (
        <GradiantHeader fontStyle="$XXS" tag="h2" weight="$semiblack">
          {subheading}
        </GradiantHeader>
      ) : null}
      {heading ? (
        <Heading fontStyle="$M" tag="h3">
          {heading}
        </Heading>
      ) : null}
      <Grid
        css={{
          [smallTiles ? '@tabletUp' : '@desktopUp']: {
            gridTemplateColumns: `repeat(${cols}, ${
              smallTiles ? 'minmax(100px, 238px)' : '1fr'
            })`,
            gridColumnGap: '$40',
            gridRowGap: '$40',
          },
        }}>
        {tiles.map(tile => (
          <NavigationItem
            key={tile.label}
            variant={smallTiles ? 'small' : 'large'}
            {...tile}
          />
        ))}
      </Grid>
    </NavSection>
  )
}

const NavSection = styled('section', {
  my: '$20',

  '& + &': {
    mt: '$40',
  },

  '@desktopUp': {
    my: '$40',

    '& + &': {
      mt: '$80',
    },
  },
})

const Grid = styled('div', {
  display: 'grid',
  gridRowGap: '$20',
  mt: '$20',
})

interface NavigationItemProps extends Tile {
  variant: 'small' | 'large'
}

const NavigationItem = ({
  label,
  href,
  description,
  comingSoon = false,
  isExternal = false,
  variant = 'large',
  Icon,
}: NavigationItemProps) => {
  const canHover = Boolean(!comingSoon)

  const isDarkMode = useIsDarkTheme()

  const renderTile = () => (
    <Tile variant={variant} canHover={canHover}>
      <BackgroundTile />
      {Icon && isStringGuard(Icon) ? (
        <IconWrapper isString>{Icon}</IconWrapper>
      ) : Icon && !isStringGuard(Icon) ? (
        <IconWrapper>
          <Icon size={32} weight={isDarkMode ? 'light' : 'regular'} />
        </IconWrapper>
      ) : null}
      <Heading tag="h2" fontStyle="$S" weight="$semiblack">
        {label}
      </Heading>
      <TileCopy>{description}</TileCopy>
      {variant === 'large' ? (
        <TileButton disabled={comingSoon}>
          {comingSoon ? <span>Coming soon!</span> : <span>Read more</span>}
        </TileButton>
      ) : null}
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
  opacity: 0,
  zIndex: '-1',
  background: '$redYellowGradient40',

  '@motion': {
    transition: 'opacity 250ms ease-out',
  },
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

  '@motion': {
    transition: 'background-color 250ms ease-out',
  },

  variants: {
    variant: {
      small: {
        maxWidth: 238,
      },
      large: {},
    },
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

const IconWrapper = styled('span', {
  display: 'block',
  mb: '$10',

  variants: {
    isString: {
      true: {
        fontSize: '$S',
      },
    },
  },
})

const TileCopy = styled(Copy, {
  mt: '$10',
  mb: '$20',
})
