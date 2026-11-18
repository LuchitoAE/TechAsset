import { useEffect, useState } from 'react'
import { listarEquiposMasUtilizados } from '../../api/reportesApi'
import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import Cargando from '../ui/Cargando'
import ContenedorDeTabla from './ContenedorDeTabla'
import { etiquetaDeCategoria } from '../../reglas/catalogos'
import {
  LIMITE_RANKING,
  LIMITE_RANKING_COMPLETO,
  resumenDeAreas,
} from '../../reglas/reportes'

// RF-15: ranking de equipos por cantidad de préstamos contados (Activos y Devueltos). Muestra los
// diez primeros y permite ver hasta cien; el desempate por código lo resuelve la API (D-09).
export default function ReporteEquiposMasUtilizados() {
  const [completo, setCompleto] = useState(false)
  const [limite, setLimite] = useState(LIMITE_RANKING)
  const [recarga, setRecarga] = useState(0)
  const [ranking, setRanking] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const control = new AbortController()

    listarEquiposMasUtilizados({ limite }, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setRanking(Array.isArray(datos) ? datos : [])
        setError(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setError(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false)
      })

    return () => control.abort()
  }, [limite, recarga])

  function alternarCompleto() {
    const siguiente = !completo
    setCompleto(siguiente)
    setCargando(true)
    setError(null)
    setLimite(siguiente ? LIMITE_RANKING_COMPLETO : LIMITE_RANKING)
  }

  if (cargando) {
    return <Cargando texto="Calculando los equipos más utilizados…" />
  }

  if (error) {
    return (
      <AlertMessage tipo="error">
        {error}{' '}
        <button
          type="button"
          onClick={() => {
            setCargando(true)
            setRecarga((actual) => actual + 1)
          }}
          className="font-semibold underline underline-offset-2"
        >
          Reintentar
        </button>
      </AlertMessage>
    )
  }

  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
        <p className="text-base font-semibold text-titulo">Todavía no hay equipos con préstamos.</p>
        <p className="mt-1 text-sm text-texto-suave">
          Cuando se apruebe o se devuelva un préstamo, el equipo aparecerá en este ranking.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-texto-suave">
          Cuentan los préstamos activos y devueltos; los rechazados no. Los empates se ordenan por
          código patrimonial.
        </p>
        <Button variante="secundario" onClick={alternarCompleto}>
          {completo ? 'Ver solo los 10 primeros' : 'Ver hasta 100 equipos'}
        </Button>
      </div>

      <ContenedorDeTabla
        id="tabla-equipos-mas-utilizados"
        titulo="Equipos más utilizados con su cantidad de préstamos y las áreas que más los usaron"
        columnas={['#', 'Equipo', 'Categoría', 'Préstamos', 'Áreas con más uso']}
      >
        {ranking.map((equipo, indice) => (
          <tr key={equipo.id_equipo} className="hover:bg-superficie-tenue">
            <td className="oculto-movil px-4 py-3 text-sm font-semibold text-texto-suave">
              {indice + 1}
            </td>
            <th scope="row" className="px-4 py-3">
              <span className="block font-mono text-xs font-semibold text-texto">
                {equipo.codigo_patrimonial_equipo}
              </span>
              <span className="block text-sm text-texto-suave">{equipo.nombre_equipo}</span>
            </th>
            <td className="px-4 py-3 text-texto-suave" data-etiqueta="Categoría">
              {etiquetaDeCategoria(equipo.categoria_equipo)}
            </td>
            <td className="px-4 py-3 font-semibold text-texto" data-etiqueta="Préstamos">
              {equipo.total_prestamos}
            </td>
            <td className="max-w-[22rem] px-4 py-3 text-texto-suave" data-etiqueta="Áreas con más uso">
              {resumenDeAreas(equipo.areas_con_mayor_uso)}
            </td>
          </tr>
        ))}
      </ContenedorDeTabla>
    </div>
  )
}
