import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AvisoFlotante from '../components/ui/AvisoFlotante'
import { ContextoDeAvisos } from './contextoDeAvisos'

// RNF-04: un solo aviso flotante para toda la aplicación, abajo a la derecha. Se cierra solo a los
// 8 s, con el botón de cerrar o cuando llega otro aviso; nunca empuja el contenido de la pantalla.
const DURACION_DEL_AVISO_MS = 8000

export default function ProveedorDeAvisos({ children }) {
  const [aviso, setAviso] = useState(null)
  const temporizador = useRef(null)

  const cerrarAviso = useCallback(() => {
    clearTimeout(temporizador.current)
    setAviso(null)
  }, [])

  const mostrar = useCallback((texto, tipo) => {
    if (!texto) return

    clearTimeout(temporizador.current)
    const nuevo = { id: Date.now(), texto, tipo }
    setAviso(nuevo)

    temporizador.current = setTimeout(() => {
      setAviso((actual) => (actual?.id === nuevo.id ? null : actual))
    }, DURACION_DEL_AVISO_MS)
  }, [])

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const valor = useMemo(
    () => ({
      mostrarAviso: (texto) => mostrar(texto, 'exito'),
      mostrarError: (texto) => mostrar(texto, 'error'),
      cerrarAviso,
    }),
    [cerrarAviso, mostrar],
  )

  return (
    <ContextoDeAvisos.Provider value={valor}>
      {children}
      <AvisoFlotante aviso={aviso} onCerrar={cerrarAviso} />
    </ContextoDeAvisos.Provider>
  )
}
