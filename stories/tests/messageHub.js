import React, { useState, useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import lorem from 'lorem-ipsum'
import { X } from 'react-feather'
import {
  animated,
  useTransition,
  config as defaultConfig
} from '../../src/targets/web/hooks'
import { testStories } from '../index'

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto,
      segoe ui, arial, sans-serif;
    background: linear-gradient(to top, #90a2b2 0%, #b0c0ce 100%);
  }
`

export const Container = styled('div')`
  position: fixed;
  z-index: 1000;
  width: 0 auto;
  top: ${props => (props.top ? '30px' : 'unset')};
  bottom: ${props => (props.top ? 'unset' : '30px')};
  margin: 0 auto;
  left: 30px;
  right: 30px;
  display: flex;
  flex-direction: ${props => (props.top ? 'column-reverse' : 'column')};
  pointer-events: none;
  align-items: ${props =>
    props.position === 'center' ? 'center' : `flex-${props.position || 'end'}`};
  @media (max-width: 680px) {
    align-items: center;
  }
`

export const Message = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 40ch;
  @media (max-width: 680px) {
    width: 100%;
  }
`

export const Content = styled('div')`
  color: white;
  background: #445159;
  opacity: 0.9;
  margin-top: ${props => (props.top ? '0' : '10px')};
  margin-bottom: ${props => (props.top ? '10px' : '0')};
  padding: 12px 22px;
  font-size: 1em;
  display: grid;
  grid-template-columns: ${props =>
    props.canClose === false ? '1fr' : '1fr auto'};
  grid-gap: 10px;
  border-radius: 3px;
  overflow: hidden;
  height: auto;
`

export const Button = styled('button')`
  cursor: pointer;
  pointer-events: all;
  outline: 0;
  border: none;
  background: transparent;
  display: flex;
  align-self: flex-end;
  overflow: hidden;
  margin: 0;
  padding: 0;
  padding-bottom: 14px;
  color: rgba(255, 255, 255, 0.5);
  :hover {
    color: rgba(255, 255, 255, 0.6);
  }
`

export const Life = styled(animated.div)`
  position: absolute;
  bottom: ${props => (props.top ? '10px' : '0')};
  left: 0px;
  width: auto;
  background-image: linear-gradient(130deg, #00b4e6, #00f0e0);
  height: 5px;
`

let id = 0

function MessageHub ({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 100000
}) {
  const [cancelMap] = useState(() => new WeakMap())
  const [refMap] = useState(() => new WeakMap())
  const [items, setItems] = useState([])
  const transitions = useTransition({
    items,
    keys: item => item.key,
    from: { opacity: 0, height: 0, life: '100%' },
    // auto doesn't work, this could be hard to solve since we need a reference to do this
    // as well as multiple render passes ...
    enter: item => next =>
      requestAnimationFrame(
        async () =>
          await next(
            { opacity: 1, height: refMap.get(item).offsetHeight },
            true
          )
      ),
    leave: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ life: '0%' })
      await next({ opacity: 0 })
      await next({ height: 0 }, true)
    },
    onRest: item =>
      setItems(state => {
        return state.filter(i => i.key !== item.key)
      }),
    // functional array configs don't seem to work, the code below would normally
    // define configs for the functional leave state above (3 calls, first uses duration)
    config: (item, state) =>
      state === 'leave' ? [{ duration: timeout }, config, config] : config
  })

  useEffect(
    () =>
      void setInterval(
        () => setItems(state => [...state, { key: id++, msg: lorem() }]),
        2000
      ),
    []
  )

  return (
    <Container>
      {transitions.map(({ key, item, props: { life, ...style } }) => (
        <Message key={key} style={style}>
          <Content ref={ref => ref && refMap.set(item, ref)}>
            <Life style={{ right: life }} />
            <p>{item.msg}</p>
            <Button
              onClick={() => cancelMap.has(item) && cancelMap.get(item)()}
            >
              <X size={18} />
            </Button>
          </Content>
        </Message>
      ))}
    </Container>
  )
}

testStories.add('Message Hub', () => <MessageHub />)
