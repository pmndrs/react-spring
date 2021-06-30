import styled from 'styled-components'

export const Image = styled.a<{ url: string; size?: string }>`
  background-image: url(${props => props.url});
  background-size: ${props => props.size || 'contain'};
  background-repeat: no-repeat;
  background-position: center center;
`

export const SpringIcon = () => {
  return (
    <IconContainer>
      <img src="/spring-icon.png" alt="" />
    </IconContainer>
  )
}

const IconContainer = styled.div`
  width: 64px !important;
  height: 64px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
  flex: 0 0 80px !important;
  display: block !important;
  position: absolute !important;
  bottom: 16px;
  right: 16px;

  & > img {
    width: 68px;
    height: 68px;
    display: block;
  }
`
