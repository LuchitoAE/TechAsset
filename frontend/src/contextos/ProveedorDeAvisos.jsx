import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AvisoFlotante from '../components/ui/AvisoFlotante'
import { ContextoDeAvisos } from './contextoDeAvisos'

// RNF-04: avisos flotantes de toda la aplicación, abajo a la derecha. Se muestran como máximo tres,
// el más reciente abajo; cada uno se cierra solo a los 8 s, con su botón o cuando se acumulan más de
// tres. Pasar el puntero o llevar el foco a un aviso pausa su cierre (guía
// persistent-toast-notifications). Nunca empujan el contenido de la pantalla.
const DURACION_DEL_AVISO_MS = 8000
const MAXIMO_DE_AVISOS = 3

export default function ProveedorDeAvisos({ children }) {
  const [avisos, setAvisos] = useState([])
  const avisosActuales = useRef([])
  const temporizadores = useRef(new Map())
  const secuencia = useRef(0)

  const actualizar = useCallback((siguientes) => {
    avisosActuales.current = siguientes
    setAvisos(siguientes)
  }, [])

  const limpiarTemporizador = useCallback((id) => {
    const temporizador = temporizadores.current.get(id)
    if (temporizador) clearTimeout(temporizador)
    temporizadores.current.delete(id)
  }, [])

  const cerrarAviso = useCallback(
    (id) => {
      limpiarTemporizador(id)
      actualizar(avisosActuales.current.filter((aviso) => aviso.id !== id))
    },
    [actualizar, limpiarTemporizador],
  )

  const programarCierre = useCallback(
    (id) => {
      limpiarTemporizador(id)
      const temporizador = setTimeout(() => cerrarAviso(id), DURACION_DEL_AVISO_MS)
      temporizadores.current.set(id, temporizador)
    },
    [cerrarAviso, limpiarTemporizador],
  )

  const pausarAviso = useCallback(
    (id) => {
      limpiarTemporizador(id)
    },
    [limpiarTemporizador],
  )

  const reanudarAviso = useCallback(
    (id) => {
      if (avisosActuales.current.some((aviso) => aviso.id === id)) programarCierre(id)
    },
    [programarCierre],
  )

  const mostrar = useCallback(
    (texto, tipo) => {
      if (!texto) return

      secuencia.current += 1
      const nuevo = { id: secuencia.current, texto, tipo }
      const siguientes = [...avisosActuales.current, nuevo]

      // Límite de avisos: los más antiguos se retiran y su temporizador se cancela.
      while (siguientes.length > MAXIMO_DE_AVISOS) {
        limpiarTemporizador(siguientes.shift().id)
      }

      actualizar(siguientes)
      programarCierre(nuevo.id)
    },
    [actualizar, limpiarTemporizador, programarCierre],
  )

  useEffect(() => {
    const mapa = temporizadores.current
    return () => {
      for (const temporizador of mapa.values()) clearTimeout(temporizador)
      mapa.clear()
    }
  }, [])

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
      <AvisoFlotante
        avisos={avisos}
        onCerrar={cerrarAviso}
        onPausar={pausarAviso}
        onReanudar={reanudarAviso}
      />
    </ContextoDeAvisos.Provider>
  )
}
