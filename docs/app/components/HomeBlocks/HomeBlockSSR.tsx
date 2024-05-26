import { useRef } from 'react'
import { animated, useSprings } from '@react-spring/web'
import useMeasure from 'react-use-measure'

import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'
import { useWindowSize } from '~/hooks/useWindowSize'

import { HomeBlockCopy } from './HomeBlockCopy'
import clsx from 'clsx'
import { section } from './shared.css'
import { bar, graphBar, sizeGraph, ssrSection } from './HomeBlockSSR.css'

const ASPECT = 259 / 140

export const HomeBlockSSR = () => {
  const [measureRef, { width }] = useMeasure()
  const sectionRef = useRef(null!)
  const { width: windowWidth } = useWindowSize()

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

  const isTablet = (windowWidth ?? 0) > 768

  return (
    <section className={clsx(section, ssrSection)} ref={sectionRef}>
      <HomeBlockCopy
        subtitle="Designed with you in mind"
        title={`Production ready with SSR support`}
      >
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
      <div className={sizeGraph}>
        <div className={graphBar}>
          <h4>{`55.1kb`}</h4>
          <animated.div className={bar} ref={measureRef} style={springs[0]} />
          <h5>{`react-spring`}</h5>
        </div>
        <div className={graphBar}>
          <h4>{`19.2kb`}</h4>
          <animated.div className={bar} style={springs[1]} />
          <h5>{isTablet ? `@react-spring/web` : 'web'}</h5>
        </div>
        <div className={graphBar}>
          <h4>{`15.2kb`}</h4>
          <animated.div className={bar} style={springs[2]} />
          <h5>{isTablet ? `@react-spring/core` : 'core'}</h5>
        </div>
      </div>
    </section>
  )
}
