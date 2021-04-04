import React, { useRef, useState, useMemo, useEffect } from 'react'
import { loremIpsum } from 'lorem-ipsum'
import { X } from 'react-feather'
import { useTransition } from '@react-spring/web'
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

  const transitions = useTransition(items, {
    from: { opacity: 0, height: 0, life: '100%' },
    keys: (item: Item) => item.key,
    enter: item => async next => await next({ opacity: 1, height: refMap.get(item).offsetHeight }),
    leave: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ life: '0%' })
      await next({ opacity: 0 })
      await next({ height: 0 })
    },
    onRest: (_, item) => {
      setItems(state =>
        state.filter(i => {
          /**
           * It would be good to not have to Typecast this,
           * it should be able to infer this from the .item in controller
           */
          return i.key !== (_.target._item as Item).key
          // return i.key !== (item as Item).key
        })
      )
    },
    config: (item, index, phase) => key => (phase === 'leave' && key === 'life' ? { duration: timeout } : config),
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
          <Content ref={ref => ref && refMap.set(item, ref)}>
            <Life style={{ right: life }} />
            <p>{item.msg}</p>
            <Button
              onClick={e => {
                e.stopPropagation()
                if (cancelMap.has(item)) {
                  cancelMap.get(item)()
                }
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
    <Main className="flex fill center" onClick={handleClick}>
      Click here to create notifications
      <MessageHub
        children={(add: AddFunction) => {
          ref.current = add
        }}
      />
    </Main>
  )
}
