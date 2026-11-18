import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarEquipos } from '../api/equiposApi'
import AlertMessage from '../components/ui/AlertMessage'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import { etiquetaDeCategoria } from '../reglas/catalogos'

// RF-07 y RF-09: equipos libres para solicitar en este momento. Cada tarjeta lleva al formulario de
// solicitud con el equipo ya elegido.
export default function PaginaDisponibilidad() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const control = new AbortController()

    listarEquipos({ estado: 'Disponible', tamano: 100 }, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setEquipos(datos.equipos)
        setError(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setError(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false)
      })

    return () => control.abort()
  }, [])

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo="Disponibilidad"
        descripcion="Equipos libres para solicitar en este momento. Un equipo con préstamo activo no aparece en esta lista."
      />

      {error && <AlertMessage tipo="error">{error}</AlertMessage>}

      {cargando ? (
        <Cargando texto="Consultando los equipos disponibles…" />
      ) : equipos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">
            No hay equipos disponibles en este momento.
          </p>
          <p className="mt-1 text-sm text-texto-suave">
            Cuando se registre una devolución o se libere un equipo de mantenimiento, aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {equipos.map((equipo) => (
            <li
              key={equipo.id_equipo}
              className="flex flex-col justify-between rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta"
            >
              <div>
                <p className="font-mono text-xs font-semibold text-texto-suave">
                  {equipo.codigo_patrimonial_equipo}
                </p>
                <p className="mt-1 text-sm font-bold text-titulo">{equipo.nombre_equipo}</p>
                <p className="mt-0.5 text-xs text-texto-suave">
                  {etiquetaDeCategoria(equipo.categoria_equipo)} · {equipo.marca_equipo}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  to={`/prestamos/nuevo?equipo=${equipo.id_equipo}`}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca transition-colors hover:bg-marca-800"
                >
                  Solicitar este equipo
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
