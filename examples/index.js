import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import './styles.css'

const components = [
  'parallaxvert',
  'parallax',
  'transitions',
  'nativespring',
  'areas',
  'trails',
  'reveals',
  'gestures',
  'timing',
  'spring',
  'tree',
  'grid',
  'morph',
  'sunburst',
  'onrest',
  'treeview',
  'keyframes',
  'script',
  'auto',
  'router',
  //'scroll',
  //'dashoffset'
  //'transitiongroup'
].reduce(
  (acc, path) => ({
    ...acc,
    [path]: Loadable({
      loader: () => import('./demos/' + path),
      loading: () => <div />,
    }),
  }),
  {}
)

const DEBUG = false
const DebugComponent = components['transitiongroup']

ReactDOM.render(
  DEBUG ? (
    <DebugComponent />
  ) : (
    <div className="app-container">
      {Object.values(components).map((Component, i) => (
        <Component key={i} />
      ))}
    </div>
  ),
  document.getElementById('root')
)
