import { animated } from 'react-spring/hooks'
import styled from 'styled-components'

const Main = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Container = styled('div')`
  position: relative;
  width: 320px;
  height: 400px;
`

const Item = styled(animated.div)`
  position: absolute;
  width: 320px;
  height: 90px;
  overflow: visible;
  pointer-events: auto;
  transform-origin: 50% 50% 0px;
  border-radius: 4px;
  color: rgb(153, 153, 153);
  line-height: 96px;
  padding-left: 32px;
  font-size: 24px;
  font-weight: 400;
  background-color: rgb(255, 255, 255);
`

export { Main, Container, Item }
