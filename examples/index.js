import React from 'react'
import ReactDOM from 'react-dom'
import DemoGrid from './components/DemoGrid'
import Demo from './components/Demo'
import examples from './components/examples-hooks'
import './styles.css'

const DEBUG = "chain-anim"

ReactDOM.render(
  <DemoGrid>
    {examples
      .filter(item => (DEBUG ? item.name.includes(DEBUG) : true))
      .map(data => (
        <Demo
          key={data.name}
          {...data}
          import={import('./demos/' + data.name)}
        />
      ))}
  </DemoGrid>,
  document.getElementById('root')
)
