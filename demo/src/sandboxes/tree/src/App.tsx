import React, { useRef, useState, useEffect } from 'react'
import { useSpring, a } from '@react-spring/web'
import useMeasure from 'react-use-measure'
import { Container, Title, Frame, Content, toggle } from './styles'
import * as Icons from './icons'

function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  useEffect(() => void (ref.current = value), [value])
  return ref.current
}

const Tree = React.memo<
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean
    name: string | JSX.Element
  }
>(({ children, name, style, defaultOpen = false }) => {
  const [isOpen, setOpen] = useState(defaultOpen)
  const previous = usePrevious(isOpen)
  const [ref, { height: viewHeight }] = useMeasure()
  const { height, opacity, y } = useSpring({
    from: { height: 0, opacity: 0, y: 0 },
    to: {
      height: isOpen ? viewHeight : 0,
      opacity: isOpen ? 1 : 0,
      y: isOpen ? 0 : 20,
    },
  })
  // @ts-ignore
  const Icon = Icons[`${children ? (isOpen ? 'Minus' : 'Plus') : 'Close'}SquareO`]
  return (
    <Frame>
      <Icon style={{ ...toggle, opacity: children ? 1 : 0.3 }} onClick={() => setOpen(!isOpen)} />
      <Title style={style}>{name}</Title>
      <Content
        style={{
          opacity,
          height: isOpen && previous === isOpen ? 'auto' : height,
        }}>
        <a.div ref={ref} style={{ y }} children={children} />
      </Content>
    </Frame>
  )
})

export default function App() {
  return (
    <Container>
      <Tree name="main" defaultOpen>
        <Tree name="hello" />
        <Tree name="subtree with children">
          <Tree name="hello" />
          <Tree name="sub-subtree with children">
            <Tree name="child 1" style={{ color: '#37ceff' }} />
            <Tree name="child 2" style={{ color: '#37ceff' }} />
            <Tree name="child 3" style={{ color: '#37ceff' }} />
            <Tree name="custom content">
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  padding: 10,
                }}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'black',
                    borderRadius: 5,
                  }}
                />
              </div>
            </Tree>
          </Tree>
          <Tree name="hello" />
        </Tree>
        <Tree name="world" />
        <Tree name={<span>🙀 something something</span>} />
      </Tree>
    </Container>
  )
}
