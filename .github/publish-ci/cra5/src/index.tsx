import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'
import './index.css'

import { worker } from './mocks/browser'

// Initialize the msw worker, wait for the service worker registration to resolve, then mount
async function render() {
  await worker.start()

  const rootNode = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  )

  rootNode.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

render()
