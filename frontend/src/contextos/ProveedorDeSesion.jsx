import { useCallback, useEffect, useMemo, useState } from 'react'
import { obtenerSesion, salir } from '../api/autenticacionApi'
import { ContextoDeSesion } from './contextoDeSesion'

// Carga la sesión al abrir la SPA y la comparte con toda la aplicación. La cookie HttpOnly viaja
// sola; aquí solo se guardan los datos que la interfaz necesita.
export default function ProveedorDeSesion({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const refrescar = useCallback(async (senal) => {
    try {
      const datos = await obtenerSesion(senal)
      setSesion(datos)
      setError(null)
      return datos
    } catch (excepcion) {
      if (excepcion.name === 'AbortError') return null

      setSesion(null)
      if (excepcion.estado !== 401) {
        setError(excepcion.message)
      }
      return null
    }
  }, [])

  useEffect(() => {
    const control = new AbortController()
    let vigente = true

    async function cargarSesion() {
      await refrescar(control.signal)
      if (vigente) setCargando(false)
    }

    cargarSesion()

    return () => {
      vigente = false
      control.abort()
    }
  }, [refrescar])

  const iniciarSesion = useCallback((datos) => {
    setSesion(datos)
    setError(null)
  }, [])

  const cerrarSesion = useCallback(async () => {
    try {
      await salir()
    } catch {
      // Aunque la API no responda, la interfaz cierra la sesión local y vuelve al ingreso.
    } finally {
      setSesion(null)
    }
  }, [])

  const valor = useMemo(
    () => ({ sesion, cargando, error, iniciarSesion, cerrarSesion, refrescar }),
    [cargando, cerrarSesion, error, iniciarSesion, refrescar, sesion],
  )

  return <ContextoDeSesion.Provider value={valor}>{children}</ContextoDeSesion.Provider>
}
