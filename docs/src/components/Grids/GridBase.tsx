import styled from 'styled-components'

export const Grid = styled.div<{ gap?: string }>`
  display: grid;
  grid-gap: ${props => props.gap || '20px'};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: minmax(200px, auto);
  width: 100%;
`
