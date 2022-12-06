import * as React from 'react'
import { useInView, useSpring, animated } from '@react-spring/web'
import { Window as Window95, WindowContent, WindowHeader } from 'react95'

import { buildInteractionObserverThreshold } from '../helpers/threshold'

const AnimatedWindow = animated(Window95)

export const Window = () => {
  const [ref, isInView] = useInView({
    rootMargin: '-45% 0px -45% 0px',
    amount: buildInteractionObserverThreshold(),
  })

  const styles = useSpring({
    scale: isInView ? 1.5 : 0,
    config: {
      tension: 300,
    },
  })

  return (
    <AnimatedWindow style={styles} ref={ref} className="window">
      <WindowHeader active={false} className="window-title">
        <span>oh-no.exe</span>
      </WindowHeader>
      <WindowContent>Surprise!</WindowContent>
    </AnimatedWindow>
  )
}
