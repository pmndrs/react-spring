import React from 'react'
import styled from 'styled-components'

const Tile = ({ letter, value }) => {
  return (
    <StyledTile>
      <StyledValue>{value}</StyledValue>
      {letter.toUpperCase()}
    </StyledTile>
  )
}

const StyledTile = styled.div`
  background-color: yellow;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  position: relative;
`

const StyledValue = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5em;
  font-size: 0.1em;
  font-weight: 400;
`

export default Tile
