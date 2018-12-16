import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTransition, useSpring, animated } from 'react-spring/hooks'
import styled from 'styled-components'
import range from 'lodash/range'

/** Problem: primitives can't be chained, it is hard to orchestrate them.
 * In this case we want the sidebar to open first, then the content transitions in.
 * On close we want the content to transition out, then the sidebar closes.
 *
 * Possible solution: Controller has a "autostart" property that's set to true by default
 * for hooks. If we can let the user controll that, they can "start" the animation on their own.
 * A hook (useChain?) could perhaps controll the order in which primites are started, watching
 * their onRest props.
 *
 * Requirements for this to:
 * 1. hooks could switch to autostart: false when a "ref" is given, which points to their controller
 * 2. onRest should only be called when all springs come to rest. In current useTransition onRest
 *    is called on every item that comes to rest instead ...
 */

function useChain(args) {
  useEffect(() => {
    console.log('useChain', args)
    let queue = Promise.resolve()
    for (let ref of args) {
      console.log('  starting', ref.current)
      if (ref && ref.current) {
        if (Array.isArray(ref.current))
          queue = queue.then(r =>
            Promise.all(
              ref.current.map(ref => new Promise(res => ref.start(res)))
            )
          )
        else queue = queue.then(r => new Promise(res => ref.current.start(res)))
      }
    }
  })
}

export default function App() {
  const [open, set] = useState(true)
  const [items] = useState(() => range(6))

  // 1. create spring-refs, which will refer to the springs Controller
  const springRef = useRef(null)
  const props = useSpring({
    from: { opacity: 0, transform: `translate3d(-100%,0,0)` },
    opacity: open ? 1 : 0,
    transform: `translate3d(${open ? 0 : -100}%,0,0)`,
    ref: springRef,
  })

  // 2. create transition-refs
  const transRef = useRef(null)
  const transitions = useTransition({
    items: open ? items : [],
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    config: { mass: 5, tension: 500, friction: 90 },
    trail: 100,
    unique: true,
    ref: transRef,
  })

  // 3. set execution order
  useChain(open ? [springRef, transRef] : [transRef, springRef])

  return (
    <Main onClick={() => set(open => !open)}>
      <Sidebar style={props}>
        {transitions.map(({ item, key, props }) => <Item key={key} style={props} />)}
      </Sidebar>
    </Main>
  )
}

const Main = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
`

const Sidebar = styled(animated.div)`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-template-rows: repeat(auto-fill, 100px);
  grid-gap: 20px;
  padding: 20px;
  background: lightgrey;
`

const Item = styled(animated.div)`
  width: 100%;
  height: 100px;
  background: hotpink;
`
