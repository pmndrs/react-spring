import styled from 'styled-components'
import { animated } from 'react-spring'

export const Main = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #bfbfbf;
`

export const Container = styled('div')`
  position: absolute;
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
  width: 30ch;
  @media (max-width: 680px) {
    width: 100%;
  }
`

export const Content = styled('div')`
  color: white;
  background: #445159;
  opacity: 0.9;
  padding: 10px 18px;
  font-size: 12px;
  display: grid;
  grid-template-columns: ${props =>
    props.canClose === false ? '1fr' : '1fr auto'};
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin-top: ${props => (props.top ? '0' : '10px')};
  margin-bottom: ${props => (props.top ? '10px' : '0')};
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
