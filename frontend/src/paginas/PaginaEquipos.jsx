import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarEquipos } from '../api/equiposApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import ChipsDeEstadoEquipo from '../components/equipos/ChipsDeEstadoEquipo'
import EtiquetaDeEstadoEquipo from '../components/equipos/EtiquetaDeEstadoEquipo'
import FiltrosEquipos from '../components/equipos/FiltrosEquipos'
import { useSesion } from '../contextos/contextoDeSesion'
import { etiquetaDeCategoria } from '../reglas/catalogos'
import { puedeGestionarEquipos } from '../reglas/permisos'

const FILTROS_VACIOS = { texto: '', estado: '', categoria: '', pagina: 1, tamano: 20 }
const PAGINA_VACIA = { total: 0, pagina: 1, tamano: 20, conteo_por_estado: [], equipos: [] }

// RF-07: inventario con filtros por texto, estado y categoría, chips con conteo y paginación.
// El Colaborador lo consulta en solo lectura; la API vuelve a comprobar el rol al escribir.
export default function PaginaEquipos() {
  const { sesion } = useSesion()
  const puedeGestionar = puedeGestionarEquipos(sesion?.rol_usuario)

  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS)
  const [pagina, setPagina] = useState(PAGINA_VACIA)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const control = new AbortController()

    listarEquipos(aplicados, control.signal)
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

  function cambiarFiltro(evento) {
    const { name, value } = evento.target
    const siguientes = { ...filtros, [name]: value, pagina: 1 }
    setFiltros(siguientes)

    // Los selectores se aplican al elegir; el texto espera al envío del formulario.
    if (name !== 'texto') {
      setCargando(true)
      setAplicados(siguientes)
    }
  }

  function aplicarFiltros() {
    setCargando(true)
    setAplicados({ ...filtros, pagina: 1 })
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS)
    setCargando(true)
    setAplicados(FILTROS_VACIOS)
  }

  function seleccionarEstado(estado) {
    const siguientes = { ...filtros, estado, pagina: 1 }
    setFiltros(siguientes)
    setCargando(true)
    setAplicados(siguientes)
  }

  function irAPagina(numero) {
    setCargando(true)
    setAplicados((actuales) => ({ ...actuales, pagina: numero }))
  }

  const totalPaginas = Math.max(1, Math.ceil(pagina.total / (pagina.tamano || 20)))
  const hayFiltros = ['texto', 'estado', 'categoria'].some(
    (campo) => String(aplicados[campo] ?? '').trim() !== '',
  )

  return (
    <div className="space-y-4">
      <EncabezadoDePagina
        titulo="Inventario de equipos"
        descripcion={
          puedeGestionar
            ? 'Consulte los equipos por código, estado o categoría, y registre o corrija sus datos.'
            : 'Consulte los equipos de Innovatech por estado, categoría y marca. Su rol permite la consulta en solo lectura.'
        }
      />

      {error && (
        <AlertMessage tipo="error">
          {error}{' '}
          <button
            type="button"
            onClick={() => {
              setCargando(true)
              setAplicados({ ...aplicados })
            }}
            className="font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </AlertMessage>
      )}

      <FiltrosEquipos
        filtros={filtros}
        onCambiar={cambiarFiltro}
        onFiltrar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
        cargando={cargando}
        puedeGestionar={puedeGestionar}
        hayFiltros={hayFiltros}
      />

      <ChipsDeEstadoEquipo
        conteos={pagina.conteo_por_estado}
        seleccionado={filtros.estado}
        onSeleccionar={seleccionarEstado}
      />

      {cargando ? (
        <div aria-busy="true">
          <Cargando texto="Consultando el inventario…" />
        </div>
      ) : pagina.equipos.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">
            {hayFiltros ? 'No hay equipos con esos filtros.' : 'El inventario está vacío.'}
          </p>
          <p className="mt-1 text-sm text-texto-suave">
            {hayFiltros
              ? 'Cambie el texto, el estado o la categoría, o limpie los filtros para ver todo el inventario.'
              : 'Registre el primer equipo con el código de su etiqueta para empezar a controlar los préstamos.'}
          </p>
          {hayFiltros ? (
            <Button variante="secundario" className="mt-4" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          ) : puedeGestionar ? (
            <Link
              to="/equipos/nuevo"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca hover:bg-marca-800"
            >
              Registrar el primer equipo
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="hidden sm:block">
            <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
              <caption className="sr-only">Inventario de equipos con su categoría, marca y estado</caption>
              <thead>
                <tr className="text-[11px] tracking-wide text-texto-suave uppercase">
                  <th scope="col" className="rounded-l-lg bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Código
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Equipo
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Categoría
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Marca
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="rounded-r-lg bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagina.equipos.map((equipo) => (
                  <tr key={equipo.id_equipo} className="group">
                    <th
                      scope="row"
                      className="rounded-l-lg border-y border-l border-borde bg-superficie px-4 py-3.5 font-mono text-xs font-semibold text-texto group-hover:bg-superficie-tenue"
                    >
                      {equipo.codigo_patrimonial_equipo}
                    </th>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 font-semibold text-texto group-hover:bg-superficie-tenue">
                      {equipo.nombre_equipo}
                    </td>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 text-texto-suave group-hover:bg-superficie-tenue">
                      {etiquetaDeCategoria(equipo.categoria_equipo)}
                    </td>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 text-texto-suave group-hover:bg-superficie-tenue">
                      {equipo.marca_equipo}
                    </td>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 group-hover:bg-superficie-tenue">
                      <EtiquetaDeEstadoEquipo estado={equipo.estado_equipo} variante="punto" />
                    </td>
                    <td className="rounded-r-lg border-y border-r border-borde bg-superficie px-4 py-3.5 group-hover:bg-superficie-tenue">
                      <Link
                        to={`/equipos/${equipo.id_equipo}`}
                        className="inline-flex items-center gap-1 rounded text-sm font-semibold text-marca-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
                      >
                        {puedeGestionar ? 'Editar' : 'Ver'}
                        <span aria-hidden="true">⋯</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 sm:hidden">
            {pagina.equipos.map((equipo) => (
              <li
                key={equipo.id_equipo}
                className="rounded-[14px] border border-borde bg-superficie p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold text-texto-suave">
                      {equipo.codigo_patrimonial_equipo}
                    </p>
                    <p className="truncate text-sm font-semibold text-texto">{equipo.nombre_equipo}</p>
                    <p className="truncate text-xs text-texto-suave">
                      {etiquetaDeCategoria(equipo.categoria_equipo)} · {equipo.marca_equipo}
                    </p>
                  </div>
                  <EtiquetaDeEstadoEquipo estado={equipo.estado_equipo} variante="punto" />
                </div>
                <div className="mt-3 text-right">
                  <Link
                    to={`/equipos/${equipo.id_equipo}`}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-marca-700"
                  >
                    {puedeGestionar ? 'Editar' : 'Ver detalle'} →
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-borde bg-superficie px-5 py-3 text-sm text-texto-suave">
            <p role="status" aria-live="polite">
              <span className="font-semibold text-texto">{pagina.total}</span>{' '}
              {pagina.total === 1 ? 'equipo' : 'equipos'} · página {pagina.pagina} de {totalPaginas}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => irAPagina(pagina.pagina - 1)}
                disabled={pagina.pagina <= 1 || cargando}
                aria-label="Página anterior"
                className="grid size-9 place-items-center rounded-lg border border-borde bg-fondo text-base font-bold text-texto transition-colors hover:bg-superficie-tenue disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                onClick={() => irAPagina(pagina.pagina + 1)}
                disabled={pagina.pagina >= totalPaginas || cargando}
                aria-label="Página siguiente"
                className="grid size-9 place-items-center rounded-lg border border-borde bg-fondo text-base font-bold text-texto transition-colors hover:bg-superficie-tenue disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
