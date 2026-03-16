import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BPHWebsite from './BPHWebsite.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BPHWebsite />
  </StrictMode>,
)
