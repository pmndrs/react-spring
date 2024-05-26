import { ArrowCircleRight } from 'phosphor-react'

import { Button } from '../Buttons/Button'
import { Heading } from '../Text/Heading'
import { CodeField } from '../Fields/FieldCode'
import { Copy } from '../Text/Copy'

import { useWindowSize } from '~/hooks/useWindowSize'
import { WidgetCarbon } from '../Widgets/WidgetCarbon'
import {
  arrowCircleRight,
  background,
  ballContainer,
  blueBall,
  blueBallContainer,
  carbonBanner,
  greenBall,
  greenBallContainer,
  header,
  left,
  leftCopy,
  navLink,
  orangeBall,
  orangeBallContainer,
  redBall,
  right,
  titleBottom,
  titleContent,
  titleTop,
  topFields,
} from './HeroHome.css'
import clsx from 'clsx'

export const HeroHome = () => {
  const { width, height } = useWindowSize()

  return (
    <header className={header}>
      <div className={titleTop} style={{ width, height }}>
        <div className={titleContent}>
          <Heading tag="h1" fontStyle="XXL">
            With naturally fluid animations you will elevate your UI &
            interactions. Bringing your apps to life has never been simpler.
          </Heading>
          <div className={topFields}>
            <CodeField />
            <Button
              className={navLink}
              variant="large"
              href="/docs/getting-started"
            >
              <span>Get started</span>
              <ArrowCircleRight className={arrowCircleRight} size={24} />
            </Button>
          </div>
          <div className={carbonBanner}>
            <WidgetCarbon />
          </div>
        </div>
      </div>
      <div className={titleBottom} style={{ width, height }}>
        <div className={left}>
          <Heading tag="h2" fontStyle="L">
            Why Springs?
          </Heading>
          <Copy fontStyle="M" className={leftCopy}>
            {`We think of animation in terms of time and curves, but that causes most of the struggle we face when trying to make elements on the screen move naturally, because nothing in the real world moves like that. \n\nSprings don’t have a defined curve or a set duration.`}
          </Copy>
        </div>
        <div className={right}>
          <Copy fontStyle="M">
            {`As Andy Matuschak (ex Apple UI-Kit developer) expressed – “Animation APIs parameterized by duration and curve are fundamentally opposed to continuous, fluid interactivity.”`}
          </Copy>
        </div>
      </div>
      <div className={background}>
        <div className={ballContainer}>
          <div className={redBall} />
        </div>
        <div className={clsx(ballContainer, orangeBallContainer)}>
          <div className={orangeBall} />
        </div>
        <div className={clsx(ballContainer, greenBallContainer)}>
          <div className={greenBall} />
        </div>
        <div className={clsx(ballContainer, blueBallContainer)}>
          <div className={blueBall} />
        </div>
      </div>
    </header>
  )
}
