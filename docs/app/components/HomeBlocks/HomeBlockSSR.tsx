import { useRef } from 'react'
import { animated, config, useSprings } from '@react-spring/web'
import useMeasure from 'react-use-measure'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

import { styled } from '~/styles/stitches.config'

import { HomeBlockCopy } from './HomeBlockCopy'
import { Section } from './HomeBlockSection'

const ASPECT = 259 / 140

export const HomeBlockSSR = () => {
  const [measureRef, { width }] = useMeasure()
  const sectionRef = useRef(null!)

  const maxBarHeight = width * ASPECT

  const heights = [
    maxBarHeight,
    maxBarHeight * (90 / 259),
    maxBarHeight * (71 / 259),
  ]

  const [springs, api] = useSprings(
    3,
    () => ({
      height: 1,
      config: {
        tension: 120,
        friction: 100,
      },
    }),
    []
  )

  const animationHasRun = useRef(false)

  useIsomorphicLayoutEffect(() => {
    if (typeof IntersectionObserver === 'function') {
      const handler = (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && !animationHasRun.current) {
          animationHasRun.current = true
          api.start(i => ({
            height: heights[i],
            delay: 250,
          }))
        }
      }

      const observer = new IntersectionObserver(handler)
      observer.observe(sectionRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [maxBarHeight])

  useIsomorphicLayoutEffect(() => {
    if (animationHasRun.current) {
      api.start(i => ({
        height: heights[i],
        delay: 250,
      }))
    }
  }, [maxBarHeight])

  return (
    <SSRSection ref={sectionRef}>
      <HomeBlockCopy
        subtitle="Designed with you in mind"
        title={`Production ready with SSR support`}>
        <p>
          Forget about useRef & useEffect to attach your animations to dom
          nodes. animated takes care of it for you.{' '}
        </p>
        <br />
        <p>
          Fully written in Typescript for easy integration to your pre-existing
          codebase.
        </p>
        <br />
        <p>
          Use a target for a small bundle size or omit the target and just use
          the core for an even smaller package.
        </p>
      </HomeBlockCopy>
      <SizeGraph>
        <GraphBar>
          <h4>{`55.1kb`}</h4>
          <Bar ref={measureRef} style={springs[0]} />
          <h5>{`react-spring`}</h5>
        </GraphBar>
        <GraphBar>
          <h4>{`19.2kb`}</h4>
          <Bar style={springs[1]} />
          <h5>{`@react-spring/web`}</h5>
        </GraphBar>
        <GraphBar>
          <h4>{`15.2kb`}</h4>
          <Bar style={springs[2]} />
          <h5>{`@react-spring/core`}</h5>
        </GraphBar>
      </SizeGraph>
    </SSRSection>
  )
}

const SSRSection = styled(Section, {
  '@tabletUp': {
    '& > *': {
      flex: '1 1',
    },
  },
})

const SizeGraph = styled('div', {
  position: 'relative',
  border: '1px solid $steel20',
  borderRadius: '$r8',
  p: '$30 $40 $40',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: 'clamp($10, 10%, $40)',
  aspectRatio: 570 / 380,
  mt: '$20',
})

const GraphBar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  width: 'calc((100% - 80rem) / 3)',
  flex: '1 1 calc((100% - 80rem) / 3)',

  '& > h4': {
    fontSize: '1.2rem',
    fontWeight: 700,
    lineHeight: '180%',
    textAlign: 'center',
    color: '$black',
  },

  '& > h5': {
    fontSize: '1.4rem',
    fontWeight: '$default',
    lineHeight: '180%',
    textAlign: 'center',
    color: '$black',
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'space-evenly',
  },
})

const Bar = styled(animated.div, {
  width: '100%',
  background: '$redYellowGradient100',
  height: 1,
  mb: 4,
  mt: 2,
  borderRadius: '$r4',
})
