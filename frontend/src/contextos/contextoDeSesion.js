import { createContext, useContext } from 'react'

// Estado compartido de la sesión. El proveedor vive en ProveedorDeSesion.jsx; este archivo solo
// declara el contexto y el hook para que las páginas no dependan de la implementación.
export const ContextoDeSesion = createContext(null)

export function useSesion() {
  const contexto = useContext(ContextoDeSesion)

  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de ProveedorDeSesion.')
  }

  return contexto
}
