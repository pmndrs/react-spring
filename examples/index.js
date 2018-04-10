import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import './index.css'

const components = [
    'scroll',
    'parallax',
    'nativespring',
    'transitions',
    'areas',
    'trails',
    'reveals',
    'sunburst',
    'gestures',
    'tree',
    'morph',
].map(path =>
    Loadable({
        loader: () => import('./demos/' + path),
        loading: () => <div />,
    }),
)

ReactDOM.render(
    <div className="app-container">{components.map((Component, i) => <Component key={i} />)}</div>,
    document.getElementById('root'),
)
