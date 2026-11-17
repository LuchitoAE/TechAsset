import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/montserrat'
import './index.css'
import App from './App.jsx'

// Punto de entrada de la SPA: monta la pantalla de bienvenida de la iteración 1.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
