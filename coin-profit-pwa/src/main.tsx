import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered', reg.scope))
      .catch(err => console.log('SW registration failed', err))
  })
}
