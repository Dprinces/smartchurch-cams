import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminWorkspace } from './AdminWorkspace.tsx'

const apiBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'https://smartchurch-cams.onrender.com/api'

const isAdminPath = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminPath ? (
      <AdminWorkspace
        apiBaseUrl={apiBaseUrl}
        onBack={() => { window.location.href = '/' }}
      />
    ) : (
      <App />
    )}
  </StrictMode>,
)
