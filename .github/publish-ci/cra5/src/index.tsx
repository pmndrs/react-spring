import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize the msw worker, wait for the service worker registration to resolve, then mount
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
