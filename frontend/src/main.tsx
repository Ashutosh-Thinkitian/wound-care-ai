import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import { Toaster } from 'react-hot-toast'
import App from './App'
import '@radix-ui/themes/styles.css'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Theme
        accentColor="blue"
        grayColor="slate"
        radius="medium"
        scaling="100%"
        appearance="light"
      >
        <App />
        <Toaster position="top-right" />
      </Theme>
    </BrowserRouter>
  </React.StrictMode>,
)
