// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SocketProvider } from './utils/SocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <SocketProvider>
    <BrowserRouter>
      <App />
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  </SocketProvider>
  // </StrictMode>
)
