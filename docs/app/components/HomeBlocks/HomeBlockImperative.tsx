import { Code } from '../Code/Code'

import { HomeBlockCopy } from './HomeBlockCopy'
import { imperativeCode } from './HomeBlockImperative.css'
import { section } from './shared.css'

const example = /* jsx */ `
import { animated, useSpring } from '@react-spring/web'

export default function () {
  const [styles, api] = useSpring(
    () => ({
      x: 0,
      rotateZ: 0,
    }),
    []
  )

  const handleClick = () => {
    api.start({
      to: [
        { x: 200, rotateZ: 360 },
        { x: 0, rotateZ: 0 },
      ],
    })
  }

  return (
    <animated.div
      className="spring-box"
      onClick={handleClick}
      style={{
        ...styles,
        cursor: 'pointer',
      }}>
      Click Me!
    </animated.div>
  )
}
`

export const HomeBlockImperative = () => (
  <section className={section}>
    <HomeBlockCopy
      subtitle="Avoid unnecessary overhead"
      title={`Run animations without \nre-rendering`}
      cta={{
        label: 'View imperative API',
        href: '/docs/concepts/imperative-api',
      }}
    >
      <p>
        Use our imperative API methods to run animations without updating state.
        Respond to events without the react rendering overhead to achieve
        smooth, fluid animation.
      </p>
    </HomeBlockCopy>
    <Code className={imperativeCode} isLive code={example} showCode={false} />
  </section>
)
