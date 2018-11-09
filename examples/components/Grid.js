import React from 'react'
import slyed from 'styled-components'

const Grid = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-column: repeat(auto-fit, minmax(150px, 1fr));
  grid-gap: 20px;
`

export default class extends React.Component {
  render() {
    return (
      <Grid>
        <span>hello</span>
      </Grid>
    )
  }
}
