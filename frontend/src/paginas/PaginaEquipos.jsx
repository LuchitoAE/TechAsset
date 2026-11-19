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

const FILTROS_VACIOS = { texto: '', estado: '', categoria: '', marca: '', pagina: 1, tamano: 20 }
const PAGINA_VACIA = { total: 0, pagina: 1, tamano: 20, conteo_por_estado: [], equipos: [] }

// RF-07: inventario con filtros por texto, estado, categoría y marca, chips con conteo y paginación.
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
    setFiltros((actuales) => ({ ...actuales, [name]: value }))
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

  const totalGeneral = pagina.conteo_por_estado.reduce((suma, conteo) => suma + conteo.total, 0)
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / (pagina.tamano || 20)))
  const hayFiltros = ['texto', 'estado', 'categoria', 'marca'].some(
    (campo) => String(aplicados[campo] ?? '').trim() !== '',
  )

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo={puedeGestionar ? 'Equipos' : 'Inventario'}
        descripcion={
          puedeGestionar
            ? 'Registre equipos con su código patrimonial único, corríjalos y cambie su estado entre Disponible, Mantenimiento y Baja.'
            : 'Consulte los equipos de Innovatech por estado, categoría y marca. Su rol permite la consulta en solo lectura.'
        }
        acciones={
          puedeGestionar ? (
            <Link
              to="/equipos/nuevo"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca transition-colors hover:bg-marca-800"
            >
              Nuevo equipo
            </Link>
          ) : null
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
      />

      <ChipsDeEstadoEquipo
        conteos={pagina.conteo_por_estado}
        seleccionado={filtros.estado}
        total={totalGeneral}
        onSeleccionar={seleccionarEstado}
      />

      {cargando ? (
        <div aria-busy="true">
          <Cargando texto="Consultando el inventario…" />
        </div>
      ) : pagina.equipos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
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
          <div className="overflow-hidden rounded-2xl border border-borde bg-superficie shadow-tarjeta">
            <table className="hidden w-full border-collapse text-left text-sm sm:table">
              <caption className="sr-only">Inventario de equipos con su categoría, marca y estado</caption>
              <thead className="bg-superficie-tenue text-xs tracking-wide text-texto-suave uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Código
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Categoría
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Marca
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {pagina.equipos.map((equipo) => (
                  <tr key={equipo.id_equipo} className="hover:bg-superficie-tenue">
                    <th scope="row" className="px-4 py-3 font-mono text-xs font-semibold text-texto">
                      {equipo.codigo_patrimonial_equipo}
                    </th>
                    <td className="px-4 py-3 text-texto">{equipo.nombre_equipo}</td>
                    <td className="px-4 py-3 text-texto-suave">
                      {etiquetaDeCategoria(equipo.categoria_equipo)}
                    </td>
                    <td className="px-4 py-3 text-texto-suave">{equipo.marca_equipo}</td>
                    <td className="px-4 py-3">
                      <EtiquetaDeEstadoEquipo estado={equipo.estado_equipo} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {puedeGestionar ? (
                        <Link
                          to={`/equipos/${equipo.id_equipo}`}
                          className="inline-flex min-h-11 items-center rounded px-2 text-sm font-semibold text-marca-700 hover:bg-marca-50"
                        >
                          Editar
                        </Link>
                      ) : (
                        <span className="text-xs text-texto-suave">Solo lectura</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-borde sm:hidden">
              {pagina.equipos.map((equipo) => (
                <li key={equipo.id_equipo} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-texto">
                        {equipo.codigo_patrimonial_equipo}
                      </p>
                      <p className="truncate text-sm font-semibold text-texto">{equipo.nombre_equipo}</p>
                      <p className="truncate text-xs text-texto-suave">
                        {etiquetaDeCategoria(equipo.categoria_equipo)} · {equipo.marca_equipo}
                      </p>
                    </div>
                    <EtiquetaDeEstadoEquipo estado={equipo.estado_equipo} />
                  </div>
                  {puedeGestionar && (
                    <div className="mt-3 text-right">
                      <Link
                        to={`/equipos/${equipo.id_equipo}`}
                        className="inline-flex min-h-11 items-center text-sm font-semibold text-marca-700"
                      >
                        Editar
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-texto-suave">
            <p role="status" aria-live="polite">
              {pagina.total} {pagina.total === 1 ? 'equipo' : 'equipos'} · página {pagina.pagina} de{' '}
              {totalPaginas}
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
