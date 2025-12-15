import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClickProvider } from '@make-software/csprclick-ui'
import './index.css'
import App from './App.tsx'

// CSPR.click configuration
const clickOptions = {
  appName: 'Casper Clicker',
  appId: 'casper-clicker',
  contentMode: 'iframe' as const,
  providers: ['casper-wallet', 'ledger', 'torus-wallet', 'casper-signer'],
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClickProvider options={clickOptions}>
      <App />
    </ClickProvider>
  </StrictMode>,
)
