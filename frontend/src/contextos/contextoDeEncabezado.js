import { createContext, useContext } from 'react'

// El shell dibuja el título de la pantalla en la barra superior. Cada página lo publica con
// `registrarTitulo` desde su EncabezadoDePagina, así el <h1> vive una sola vez y cambia al navegar.
export const ContextoDeEncabezado = createContext(null)

export function useEncabezadoDePagina() {
  return useContext(ContextoDeEncabezado)
}
