import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import DemoGrid from './components/DemoGrid'
import Demo from './components/Demo'
import examples from './components/examples-hooks'
import './styles.css'

ReactDOM.render(
  <DemoGrid>
    {examples.filter(item => item.name === 'hooks/list-reordering').map(data => (
      <Demo key={data.name} {...data} import={import('./demos/' + data.name)} />
    ))}
  </DemoGrid>,
  document.getElementById('root')
)
