import styled from 'styled-components'

export const DemoGrid = ({ children }) => <Container>{children}</Container>

const Container = styled('div')`
  position: relative;
  width: 100%;
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: 0;
  user-select: none;

  & > div:last-of-type:nth-child(odd) {
    grid-column: 1/-1;
  }
`
