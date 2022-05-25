import { useSprings, animated, useSpring } from '@react-spring/web'

import { styled } from '~/styles/stitches.config'

const COLORS = [
  { start: '#52DEE580', end: '#52DEE500' },
  { start: 'var(--colors-red80)', end: '#ffb6b600' },
  { start: '#fff59a', end: '#fff59a00' },
]

const TAGLINE = ['Make', 'Memorable', 'Experiences'] as const

const PATTERN_VALUE = 16

const GRADIENT_ANIMATION_VALUES: [
  animateX: { dur: string; values: string },
  animateY: { dur: string; values: string },
  transform: {
    dur: string
    from: string
    to: string
  }
][] = [
  [
    {
      dur: '20s',
      values: '40%;0%;40%',
    },
    {
      dur: '20s',
      values: '0%;25%;0%',
    },
    {
      from: '0 50% 50%',
      to: '360 50% 50%',
      dur: '16s',
    },
  ],
  [
    {
      dur: '20s',
      values: '15%;0%;15%',
    },
    {
      dur: '20s',
      values: '30%;0%;30%;',
    },
    {
      from: '0 50% 50%',
      to: '360 50% 50%',
      dur: '16s',
    },
  ],
  [
    {
      dur: '20s',
      values: '0%;-10%;0%',
    },
    { dur: '20s', values: '0%;-40%;0%' },
    {
      from: '360 50% 50%',
      to: '0 50% 50%',
      dur: '16s',
    },
  ],
]

export const HeroHome = () => {
  const [springs] = useSprings(COLORS.length, () => ({
    from: {
      fx: '0',
    },
    to: {
      fx: '5%',
    },
    loop: {
      reverse: true,
    },
    config: {
      mass: 40,
      tension: 5,
      friction: 80,
    },
  }))

  const [positionSprings] = useSprings(TAGLINE.length, i => ({
    from: {
      y: '100%',
    },
    to: {
      y: '0',
    },
    delay: (i / 2) * 400,
    config: {
      mass: 1,
      tension: 80,
      friction: 30,
    },
  }))

  return (
    <HeroHeader>
      <Title>
        {TAGLINE.map((line, i) => (
          <TitleFragment key={line}>
            <TitleAnimatedSpan color={line} style={positionSprings[i]}>
              {line}
            </TitleAnimatedSpan>
          </TitleFragment>
        ))}
      </Title>
      <SVG viewBox={`0 0 1 1`} preserveAspectRatio="xMidYMid slice">
        <defs>
          {springs.map((styles, i) => (
            <animated.radialGradient
              id={`Gradient${i + 1}`}
              cx="50%"
              cy="50%"
              fy="50%"
              r="0.5"
              {...styles}>
              <stop offset="0%" stopColor={COLORS[i].start}></stop>
              <stop offset="100%" stopColor={COLORS[i].end}></stop>
            </animated.radialGradient>
          ))}
        </defs>
        {GRADIENT_ANIMATION_VALUES.map((animations, i) => (
          <rect
            x={animations[0].values.split(';')[0]}
            y={animations[1].values.split(';')[0]}
            width="100%"
            height="100%"
            fill={`url(#Gradient${i + 1})`}>
            <animate
              attributeName="x"
              {...animations[0]}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              {...animations[1]}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              {...animations[2]}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </SVG>
      <SVG
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        pattern>
        <defs>
          <pattern
            id="pattern"
            patternUnits="userSpaceOnUse"
            width={PATTERN_VALUE}
            height={PATTERN_VALUE}>
            <line
              x1="0"
              y="0"
              x2="0"
              y2={PATTERN_VALUE}
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="0"
              y="0"
              x2={PATTERN_VALUE}
              y2="0"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#pattern)"
          opacity="1"></rect>
      </SVG>
    </HeroHeader>
  )
}

const HeroHeader = styled('header', {
  position: 'relative',
  height: '100vh',
  zIndex: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:after': {
    content: '',
    position: 'absolute',
    bottom: 0,
    height: 300,
    width: '100%',
    zIndex: '10',
    background:
      'linear-gradient(0deg, rgba(250,250,250,1) 0%, rgba(250,250,250,0) 100%)',
  },
})

const Title = styled('h1', {
  fontSize: 'max(5rem, 11.1vw)',
  color: '$white',
  mixBlendMode: 'overlay',
  position: 'relative',
  zIndex: '$1',
  filter: 'saturate(1.5)',
})

const TitleFragment = styled('span', {
  display: 'block',
  mb: '$20',
  overflow: 'hidden',
})

const TitleAnimatedSpan = styled(animated.span, {
  display: 'block',
  px: '$40',
  width: 'max-content',

  variants: {
    color: {
      [TAGLINE[0]]: {
        backgroundColor: '#0069ff',
        filter: 'saturate(1)',
      },
      [TAGLINE[1]]: {
        backgroundColor: '$red80',
        filter: 'saturate(1.4)',
      },
      [TAGLINE[2]]: {
        backgroundColor: '#ffb457',
        filter: 'saturate(1)',
      },
    },
  },
})

const SVG = styled('svg', {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: '0',

  variants: {
    pattern: {
      true: {
        mixBlendMode: 'overlay',
        opacity: 0.3,
      },
    },
  },
})
