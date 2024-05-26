import { IconProps } from 'phosphor-react'
import { assignInlineVars } from '@vanilla-extract/dynamic'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { Link } from '@remix-run/react'
import { isStringGuard } from '~/helpers/guards'
import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'
import { Button } from '../Buttons/Button'
import { Copy } from '../Text/Copy'
import { GradientHeader } from '../Text/GradientHeader'
import { Heading } from '../Text/Heading'
import clsx from 'clsx'
import {
  backgroundTile,
  colsVar,
  grid,
  iconWrapper,
  navSection,
  tile,
  tileButton,
  tileCanHover,
  tileCopy,
} from './NavigationGrid.css'

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
    <section className={clsx(navSection, className)}>
      {subheading ? (
        <GradientHeader fontStyle="XXS" tag="h2" weight="semiblack">
          {subheading}
        </GradientHeader>
      ) : null}
      {heading ? (
        <Heading fontStyle="M" tag="h3">
          {heading}
        </Heading>
      ) : null}
      <div
        className={grid({
          smallTiles: Boolean(smallTiles),
        })}
        style={{
          ...assignInlineVars({
            [colsVar]: `${cols}`,
          }),
        }}
      >
        {tiles.map(tile => (
          <NavigationItem
            key={tile.label}
            variant={smallTiles ? 'small' : 'large'}
            {...tile}
          />
        ))}
      </div>
    </section>
  )
}

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
    <span
      className={clsx(
        tile({
          small: variant === 'small',
        }),
        canHover && tileCanHover
      )}
    >
      <span className={backgroundTile} />
      {Icon && isStringGuard(Icon) ? (
        <span className={iconWrapper({ isString: true })}>{Icon}</span>
      ) : Icon && !isStringGuard(Icon) ? (
        <span className={iconWrapper({ isString: false })}>
          <Icon size={32} weight={isDarkMode ? 'light' : 'regular'} />
        </span>
      ) : null}
      <Heading tag="h2" fontStyle="S" weight="semiblack">
        {label}
      </Heading>
      <Copy className={tileCopy}>{description}</Copy>
      {variant === 'large' ? (
        <Button className={tileButton} disabled={comingSoon}>
          {comingSoon ? <span>Coming soon!</span> : <span>Read more</span>}
        </Button>
      ) : null}
    </span>
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
