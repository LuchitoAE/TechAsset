import { useEffect, useMemo, useState } from 'react'
import { listarPrestamosPorArea } from '../../api/reportesApi'
import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import Cargando from '../ui/Cargando'
import DateInput from '../ui/DateInput'
import ContenedorDeTabla from './ContenedorDeTabla'
import {
  anchoDeBarra,
  formatearPorcentaje,
  ordenarFilas,
  siguienteOrden,
  validarRangoDeFechas,
} from '../../reglas/reportes'

const FILTROS_VACIOS = { desde: '', hasta: '' }
const REPORTE_VACIO = { total_prestamos: 0, areas: [] }

const COLUMNAS = [
  { etiqueta: 'Área', clave: 'area_responsable', tipo: 'texto' },
  { etiqueta: 'Préstamos', clave: 'total_prestamos', tipo: 'numero' },
  { etiqueta: 'Porcentaje', clave: 'porcentaje_prestamos', tipo: 'numero' },
]

// RF-16: préstamos por área del responsable en un periodo. Las áreas sin préstamos aparecen en cero
// y el porcentaje se calcula sobre el total del periodo (D-09). La API comprueba el rol. La tabla se
// puede ordenar por área, cantidad o porcentaje porque el reporte trae todas las áreas de una vez.
export default function ReportePrestamosPorArea() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS)
  const [errores, setErrores] = useState({})
  const [reporte, setReporte] = useState(REPORTE_VACIO)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [orden, setOrden] = useState({
    clave: 'total_prestamos',
    direccion: 'descendente',
    tipo: 'numero',
  })

  useEffect(() => {
    const control = new AbortController()

    listarPrestamosPorArea(aplicados, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setReporte(datos)
        setError(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setError(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false)
      })

    return () => control.abort()
  }, [aplicados])

  const areas = useMemo(() => ordenarFilas(reporte.areas ?? [], orden), [orden, reporte.areas])

  function cambiar(evento) {
    const { name, value } = evento.target
    setFiltros((actuales) => ({ ...actuales, [name]: value }))
  }

  function filtrar() {
    const nuevosErrores = validarRangoDeFechas(filtros.desde, filtros.hasta)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setCargando(true)
    setError(null)
    setAplicados({ ...filtros })
  }

  function limpiar() {
    setFiltros(FILTROS_VACIOS)
    setErrores({})
    setCargando(true)
    setError(null)
    setAplicados(FILTROS_VACIOS)
  }

  return (
    <div className="space-y-5">
      <search aria-label="Filtros de préstamos por área" className="block">
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            filtrar()
          }}
          className="rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta sm:p-5"
        >
            <div className="grid gap-4 md:grid-cols-2">
              <DateInput
                label="Préstamos desde"
                name="desde"
                value={filtros.desde}
                onChange={cambiar}
                error={errores.desde}
              />
              <DateInput
                label="Préstamos hasta"
                name="hasta"
                value={filtros.hasta}
                onChange={cambiar}
                ayuda="Sin fechas se cuenta todo el historial."
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <Button variante="fantasma" onClick={limpiar} disabled={cargando}>
                Limpiar filtros
              </Button>
              <Button tipo="submit" cargando={cargando} textoCargando="Calculando…">
                Filtrar
              </Button>
            </div>
        </form>
      </search>

      {error && (
        <AlertMessage tipo="error">
          {error}{' '}
          <button
            type="button"
            onClick={() => {
              setCargando(true)
              setAplicados((actuales) => ({ ...actuales }))
            }}
            className="font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </AlertMessage>
      )}

      {cargando ? (
        <div aria-busy="true">
          <Cargando texto="Contando los préstamos por área…" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-texto-suave">
              Cuentan los préstamos activos y devueltos; los rechazados y las solicitudes pendientes no.
            </p>
            <p
              role="status"
              aria-live="polite"
              className="rounded-full bg-superficie-tenue px-3 py-1 text-sm font-semibold text-texto"
            >
              Total del periodo: {reporte.total_prestamos}
            </p>
          </div>

          {reporte.total_prestamos === 0 && (
            <AlertMessage tipo="informacion">
              No hay préstamos en el periodo consultado. Las áreas aparecen en cero para que pueda
              comparar el periodo con otro.
            </AlertMessage>
          )}

          <ContenedorDeTabla
            id="tabla-prestamos-por-area"
            titulo="Préstamos por área del responsable en el periodo consultado"
            columnas={COLUMNAS}
            nota="El porcentaje se calcula sobre el total del periodo consultado. Pulse el encabezado de una columna para ordenar."
            orden={orden}
            onOrdenar={(columna) => setOrden((actual) => siguienteOrden(actual, columna))}
          >
            {areas.map((fila) => (
              <tr key={fila.area_responsable} className="hover:bg-superficie-tenue">
                <th scope="row" className="px-4 py-3 text-sm font-semibold text-texto">
                  {fila.area_responsable}
                </th>
                <td className="px-4 py-3 text-texto" data-etiqueta="Préstamos">
                  {fila.total_prestamos}
                </td>
                <td className="px-4 py-3" data-etiqueta="Porcentaje">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="hidden h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-superficie-tenue sm:block"
                    >
                      <span
                        className="block h-full rounded-full bg-marca-600"
                        style={{ width: anchoDeBarra(fila.porcentaje_prestamos) }}
                      />
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap text-texto">
                      {formatearPorcentaje(fila.porcentaje_prestamos)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </ContenedorDeTabla>
        </>
      )}
    </div>
  )
}
