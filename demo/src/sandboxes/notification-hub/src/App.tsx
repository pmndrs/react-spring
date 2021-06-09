import React, { useRef, useState, useMemo, useEffect, MouseEvent } from 'react'
import { loremIpsum } from 'lorem-ipsum'
import { X } from 'react-feather'
import { useTransitions } from '@react-spring/web'
import { Main, Container, Message, Button, Content, Life } from './styles'

let id = 0

interface MessageHubProps {
  config?: {
    tension: number
    friction: number
    precision: number
  }
  timeout?: number
  children: (add: AddFunction) => void
}

type AddFunction = (msg: string) => void

interface Item {
  key: number
  msg: string
}

function MessageHub({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 3000,
  children,
}: MessageHubProps) {
  const refMap = useMemo(() => new WeakMap(), [])
  const cancelMap = useMemo(() => new WeakMap(), [])
  const [items, setItems] = useState<Item[]>([])

  const transitions = useTransitions(items, {
    from: { opacity: 0, height: 0, life: '100%' },
    keys: item => item.key,
    enter: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ opacity: 1, height: refMap.get(item).offsetHeight })
      await next({ life: '0%' })
    },
    leave: [{ opacity: 0 }, { height: 0 }],
    onRest: (result, ctrl, item) => {
      setItems(state =>
        state.filter(i => {
          return i.key !== item.key
        })
      )
    },
    config: (item, index, phase) => key => phase === 'enter' && key === 'life' ? { duration: timeout } : config,
  })

  useEffect(() => {
    children((msg: string) => {
      setItems(state => [...state, { key: id++, msg }])
    })
  }, [])

  return (
    <Container>
      {transitions(({ life, ...style }, item) => (
        <Message style={style}>
          <Content ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
            <Life style={{ right: life }} />
            <p>{item.msg}</p>
            <Button
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                if (cancelMap.has(item)) cancelMap.get(item)()
              }}>
              <X size={18} />
            </Button>
          </Content>
        </Message>
      ))}
    </Container>
  )
}

export default function App() {
  const ref = useRef<null | AddFunction>(null)

  const handleClick = () => {
    ref.current?.(loremIpsum())
  }

  return (
    <Main onClick={handleClick}>
      Click here to create notifications
      <MessageHub
        children={(add: AddFunction) => {
          ref.current = add
        }}
      />
    </Main>
  )
}
