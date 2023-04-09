import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

async function render() {
  const rootNode = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  )

  rootNode.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

render()
