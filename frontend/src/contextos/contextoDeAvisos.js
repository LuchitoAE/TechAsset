import { createContext, useContext } from 'react'

// Avisos flotantes de la aplicación (RNF-04). El proveedor vive en ProveedorDeAvisos.jsx; este
// archivo solo declara el contexto y el hook para que las páginas no dependan de la implementación.
export const ContextoDeAvisos = createContext(null)

export function useAvisos() {
  const contexto = useContext(ContextoDeAvisos)

  if (!contexto) {
    throw new Error('useAvisos debe usarse dentro de ProveedorDeAvisos.')
  }

  return contexto
}
