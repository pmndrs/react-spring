import { WheelEvent } from 'react'
import { animated, useSprings } from '@react-spring/web'

import { getFontStyles } from '~/styles/fontStyles'
import { styled } from '~/styles/stitches.config'

import { SubtitleSchemaItem } from '../../../scripts/docs/navigation'

interface HeaderSubnavProps {
  className?: string
  subnav: SubtitleSchemaItem
}

export const HeaderSubnav = ({ className, subnav }: HeaderSubnavProps) => {
  const [springs, ref] = useSprings(2, i => ({
    opacity: i,
  }))

  const handleScroll = (e: WheelEvent<HTMLDivElement>) => {
    const el = e.target as HTMLDivElement

    if (el.scrollLeft === el.scrollWidth - el.clientWidth) {
      ref.start(i => ({
        opacity: Number(!i),
      }))
    } else if (el.scrollLeft === 0) {
      ref.start(i => ({
        opacity: i,
      }))
    } else {
      ref.start(() => ({
        opacity: 1,
      }))
    }
  }

  return (
    <SubNavContainer className={className}>
      <GradientLeft style={{ ...springs[0] }} />
      <SubNavScroller onScroll={handleScroll}>
        <SubNavList>
          {subnav.map(({ href, label, id }) => (
            <SubNavListItem key={id}>
              <SubNavAnchor href={href}>{label}</SubNavAnchor>
            </SubNavListItem>
          ))}
        </SubNavList>
      </SubNavScroller>
      <GradientRight style={{ ...springs[1] }} />
    </SubNavContainer>
  )
}

const SubNavContainer = styled('nav', {
  m: '$30 0',
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
})

const SubNavScroller = styled('div', {
  overflow: '-moz-scrollbars-none',
  overflowX: 'auto',
  mx: -28,
  px: 28,

  '&::-webkit-scrollbar': {
    display: 'none',
  },

  '@tabletUp': {
    mx: 0,
    px: 0,
  },
})

const GradientShared = {
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '2rem',
}

const GradientRight = styled(animated.div, {
  ...GradientShared,
  right: -28,
  backgroundImage: 'linear-gradient(90deg, $white0 0%, $white 100%)',

  '@tabletUp': {
    right: 0,
  },
})

const GradientLeft = styled(animated.div, {
  ...GradientShared,
  left: -28,
  backgroundImage: 'linear-gradient(90deg, $white 0%, $white0 100%)',

  '@tabletUp': {
    left: 0,
  },
})

const SubNavList = styled('ul', {
  listStyle: 'none',
  display: 'flex',
  margin: 0,
  padding: '0 0.4rem',
  gap: '$20',

  '@tabletUp': {
    gap: '$30',
  },
})

const SubNavListItem = styled('li', {
  '&:last-child': {
    pr: 28,
  },

  '@tabletUp': {
    '&:last-child': {
      pr: 0,
    },
  },
})

const SubNavAnchor = styled('a', {
  ...getFontStyles('$XXS'),
  whiteSpace: 'nowrap',
})
