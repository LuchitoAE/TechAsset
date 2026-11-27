import { useEffect, useState } from 'react'
import { listarMovimientos } from '../../api/reportesApi'
import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import Cargando from '../ui/Cargando'
import DateInput from '../ui/DateInput'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import ContenedorDeTabla from './ContenedorDeTabla'
import EtiquetaDeTipoMovimiento from './EtiquetaDeTipoMovimiento'
import {
  TIPOS_DE_MOVIMIENTO,
  formatearFechaYHora,
  validarRangoDeFechas,
} from '../../reglas/reportes'

const FILTROS_VACIOS = {
  tipo: '',
  equipo: '',
  usuario: '',
  texto: '',
  desde: '',
  hasta: '',
  pagina: 1,
  tamano: 20,
}
const PAGINA_VACIA = { total: 0, pagina: 1, tamano: 20, movimientos: [] }

// RF-17: historial de movimientos con filtros por tipo, equipo, usuario, texto y fechas, paginado
// del más reciente al más antiguo. La API comprueba el rol (Responsable y Administrador).
export default function ReporteMovimientos() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS)
  const [errores, setErrores] = useState({})
  const [pagina, setPagina] = useState(PAGINA_VACIA)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const control = new AbortController()

    listarMovimientos(aplicados, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setPagina(datos)
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
    setAplicados({ ...filtros, pagina: 1 })
  }

  function limpiar() {
    setFiltros(FILTROS_VACIOS)
    setErrores({})
    setCargando(true)
    setError(null)
    setAplicados(FILTROS_VACIOS)
  }

  function irAPagina(numero) {
    setCargando(true)
    setAplicados((actuales) => ({ ...actuales, pagina: numero }))
  }

  const totalPaginas = Math.max(1, Math.ceil(pagina.total / (pagina.tamano || 20)))

  return (
    <div className="space-y-5">
      <search aria-label="Filtros del historial de movimientos" className="block">
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            filtrar()
          }}
          className="rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectInput
              label="Tipo de movimiento"
              name="tipo"
              value={filtros.tipo}
              onChange={cambiar}
              opciones={TIPOS_DE_MOVIMIENTO}
              placeholder="Todos los tipos"
            />
            <TextInput
              label="Equipo"
              name="equipo"
              value={filtros.equipo}
              onChange={cambiar}
              placeholder="Código o nombre del equipo"
              autoComplete="off"
            />
            <TextInput
              label="Usuario"
              name="usuario"
              value={filtros.usuario}
              onChange={cambiar}
              placeholder="Nombres o apellidos"
              autoComplete="off"
            />
            <DateInput label="Desde" name="desde" value={filtros.desde} onChange={cambiar} error={errores.desde} />
            <DateInput label="Hasta" name="hasta" value={filtros.hasta} onChange={cambiar} />
            <TextInput
              label="Buscar en el detalle"
              name="texto"
              value={filtros.texto}
              onChange={cambiar}
              placeholder="Texto del movimiento"
              autoComplete="off"
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Button variante="fantasma" onClick={limpiar} disabled={cargando}>
              Limpiar filtros
            </Button>
            <Button tipo="submit" cargando={cargando} textoCargando="Buscando…">
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
          <Cargando texto="Consultando el historial de movimientos…" />
        </div>
      ) : pagina.total === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">No hay movimientos con esos filtros.</p>
          <p className="mt-1 text-sm text-texto-suave">
            Cambie el tipo, el equipo, el usuario o las fechas, o limpie los filtros para ver todo el
            historial.
          </p>
          <Button variante="secundario" className="mt-4" onClick={limpiar}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <ContenedorDeTabla
            id="tabla-movimientos"
            titulo="Historial de movimientos del inventario y de los préstamos"
            columnas={['Fecha y hora', 'Tipo', 'Equipo', 'Usuario', 'Detalle']}
            nota="Las fechas y horas se muestran en la zona de Lima. Desplace la tabla para ver todas las columnas."
          >
            {pagina.movimientos.map((movimiento) => (
              <tr key={movimiento.id_movimiento} className="hover:bg-superficie-tenue">
                <th
                  scope="row"
                  className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-texto"
                >
                  {formatearFechaYHora(movimiento.fecha_movimiento)}
                </th>
                <td className="px-4 py-3" data-etiqueta="Tipo">
                  <EtiquetaDeTipoMovimiento tipo={movimiento.tipo_movimiento} />
                </td>
                <td className="px-4 py-3" data-etiqueta="Equipo">
                  <span className="block font-mono text-xs font-semibold text-texto">
                    {movimiento.codigo_patrimonial_equipo}
                  </span>
                  <span className="block text-xs text-texto-suave">{movimiento.nombre_equipo}</span>
                </td>
                <td className="px-4 py-3 text-texto-suave" data-etiqueta="Usuario">
                  {movimiento.nombre_usuario}
                </td>
                <td className="max-w-[26rem] px-4 py-3 text-texto-suave" data-etiqueta="Detalle">
                  {movimiento.detalle_movimiento}
                </td>
              </tr>
            ))}
          </ContenedorDeTabla>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-texto-suave">
            <p role="status" aria-live="polite">
              {pagina.total} {pagina.total === 1 ? 'movimiento' : 'movimientos'} · página{' '}
              {pagina.pagina} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <Button
                variante="secundario"
                onClick={() => irAPagina(pagina.pagina - 1)}
                disabled={pagina.pagina <= 1 || cargando}
              >
                Anterior
              </Button>
              <Button
                variante="secundario"
                onClick={() => irAPagina(pagina.pagina + 1)}
                disabled={pagina.pagina >= totalPaginas || cargando}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
