import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import './index.css'

import { Web3Provider } from './components/web3-provider'
import LandingPage from './pages/landing-page'

// Global error handler to suppress network errors from external libraries
// These errors are expected when offline and don't need to be shown to users
window.addEventListener('error', (event) => {
  // Suppress network errors from external libraries (ConnectKit, wagmi, Coinbase Wallet SDK)
  const errorMessage = event.message || ''
  const errorSource = event.filename || ''
  
  // Check if it's a network error from external libraries or blocked by ad blocker
  const isNetworkError = 
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('WebSocket connection') ||
    errorMessage.includes('connection timeout') ||
    errorSource.includes('connectkit') ||
    errorSource.includes('wagmi') ||
    errorSource.includes('coinbase') ||
    errorSource.includes('walletlink') ||
    errorSource.includes('googleapis') ||
    errorSource.includes('google.com') ||
    errorSource.includes('cloudflareinsights') ||
    errorSource.includes('cloudflare.com')
  
  if (isNetworkError) {
    // Suppress these errors - they're expected when offline
    event.preventDefault()
    return false
  }
  
  return true
})

// Suppress unhandled promise rejections from external libraries
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const errorMessage = reason?.message || String(reason) || ''
  const errorStack = reason?.stack || ''
  
  // Check if it's a network error from external libraries or blocked by ad blocker
  const isNetworkError = 
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('WebSocket') ||
    errorMessage.includes('connection timeout') ||
    errorMessage.includes('EIP1193 provider connection timeout') ||
    errorMessage.includes('Family Accounts is not connected') ||
    errorStack.includes('connectkit') ||
    errorStack.includes('wagmi') ||
    errorStack.includes('coinbase') ||
    errorStack.includes('walletlink') ||
    errorStack.includes('googleapis') ||
    errorStack.includes('google.com') ||
    errorStack.includes('cloudflareinsights') ||
    errorStack.includes('cloudflare.com')
  
  if (isNetworkError) {
    // Suppress these errors - they're expected when offline
    event.preventDefault()
    return false
  }
  
  return true
})

// Suppress console logs from external libraries (ConnectKit, wagmi, etc.)
// These libraries sometimes log debug objects that clutter the console
const originalConsoleLog = console.log
console.log = (...args: any[]) => {
  // Filter out logs from external libraries
  const firstArg = args[0]
  if (
    typeof firstArg === 'object' &&
    firstArg !== null &&
    !Array.isArray(firstArg) &&
    Object.keys(firstArg).length === 1 &&
    Object.keys(firstArg)[0].match(/^[a-zA-Z0-9]{5}$/) // Pattern like uYln4
  ) {
    // This looks like a debug object from external library, suppress it
    return
  }
  
  // Allow logs that start with [App], [Auth], etc. (our own logs)
  if (typeof firstArg === 'string' && firstArg.startsWith('[')) {
    originalConsoleLog.apply(console, args)
    return
  }
  
  // Allow other logs
  originalConsoleLog.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Web3Provider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<App />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Web3Provider>
  </React.StrictMode>,
)