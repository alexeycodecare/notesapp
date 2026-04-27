import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.scss'
import Auth from './templates/Auth/Auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth />
  </StrictMode>,
)
