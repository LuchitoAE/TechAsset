import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarEquiposPorEstado } from '../../api/reportesApi'
import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import Cargando from '../ui/Cargando'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import ContenedorDeTabla from './ContenedorDeTabla'
import { CATEGORIAS_EQUIPO, etiquetaDeCategoria, etiquetaDeEstadoEquipo } from '../../reglas/catalogos'

const FILTROS_VACIOS = { texto: '', categoria: '', marca: '' }
const REPORTE_VACIO = { total: 0, estados: [] }

// RF-14: equipos por estado. Los cuatro estados se muestran siempre, con su lista y su total, y la
// suma coincide con el total general. La API comprueba el rol; aquí solo se dibuja.
export default function ReporteEquiposPorEstado() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS)
  const [reporte, setReporte] = useState(REPORTE_VACIO)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const control = new AbortController()

    listarEquiposPorEstado(aplicados, control.signal)
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

  function cambiar(evento) {
    const { name, value } = evento.target
    setFiltros((actuales) => ({ ...actuales, [name]: value }))
  }

  function filtrar() {
    setCargando(true)
    setError(null)
    setAplicados({ ...filtros })
  }

  function limpiar() {
    setFiltros(FILTROS_VACIOS)
    setCargando(true)
    setError(null)
    setAplicados(FILTROS_VACIOS)
  }

  return (
    <div className="space-y-5">
      <search aria-label="Filtros de equipos por estado" className="block">
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            filtrar()
          }}
          className="rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <TextInput
              label="Buscar"
              name="texto"
              value={filtros.texto}
              onChange={cambiar}
              placeholder="Código, equipo o marca"
              autoComplete="off"
            />
            <SelectInput
              label="Categoría"
              name="categoria"
              value={filtros.categoria}
              onChange={cambiar}
              opciones={CATEGORIAS_EQUIPO}
              placeholder="Todas las categorías"
            />
            <TextInput
              label="Marca"
              name="marca"
              value={filtros.marca}
              onChange={cambiar}
              placeholder="Todas las marcas"
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
          <Cargando texto="Contando los equipos por estado…" />
        </div>
      ) : reporte.total === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">
            {aplicados.texto || aplicados.categoria || aplicados.marca
              ? 'No hay equipos con esos filtros.'
              : 'Todavía no hay equipos registrados.'}
          </p>
          <p className="mt-1 text-sm text-texto-suave">
            {aplicados.texto || aplicados.categoria || aplicados.marca
              ? 'Cambie el texto, la categoría o la marca, o limpie los filtros para ver todo el inventario.'
              : 'Cuando se registre el primer equipo, aparecerá en este reporte con su estado.'}
          </p>
          {aplicados.texto || aplicados.categoria || aplicados.marca ? (
            <Button variante="secundario" className="mt-4" onClick={limpiar}>
              Limpiar filtros
            </Button>
          ) : (
            <Link
              to="/equipos/nuevo"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca hover:bg-marca-800"
            >
              Registrar el primer equipo
            </Link>
          )}
        </div>
      ) : (
        <>
          <p role="status" aria-live="polite" className="text-sm text-texto-suave">
            {reporte.total} {reporte.total === 1 ? 'equipo' : 'equipos'} en total. La suma de los cuatro
            estados coincide con este total.
          </p>

          <div className="grid gap-4 xl:grid-cols-2">
            {reporte.estados.map((grupo) => (
              <section key={grupo.estado_equipo} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-titulo">
                    {etiquetaDeEstadoEquipo(grupo.estado_equipo)}
                  </h3>
                  <span className="rounded-full bg-superficie-tenue px-2.5 py-1 text-xs font-semibold text-texto-suave">
                    {grupo.total} {grupo.total === 1 ? 'equipo' : 'equipos'}
                  </span>
                </div>

                {grupo.equipos.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-borde bg-superficie px-4 py-6 text-center text-sm text-texto-suave">
                    Sin equipos en este estado.
                  </p>
                ) : (
                  <ContenedorDeTabla
                    id={`equipos-${grupo.estado_equipo}`}
                    titulo={`Equipos en estado ${etiquetaDeEstadoEquipo(grupo.estado_equipo)}`}
                    columnas={['Código', 'Equipo', 'Categoría', 'Marca']}
                  >
                    {grupo.equipos.map((equipo) => (
                      <tr key={equipo.id_equipo} className="hover:bg-superficie-tenue">
                        <th
                          scope="row"
                          className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap text-texto"
                        >
                          {equipo.codigo_patrimonial_equipo}
                        </th>
                        <td className="px-4 py-3 text-texto" data-etiqueta="Equipo">
                          {equipo.nombre_equipo}
                        </td>
                        <td className="px-4 py-3 text-texto-suave" data-etiqueta="Categoría">
                          {etiquetaDeCategoria(equipo.categoria_equipo)}
                        </td>
                        <td className="px-4 py-3 text-texto-suave" data-etiqueta="Marca">
                          {equipo.marca_equipo}
                        </td>
                      </tr>
                    ))}
                  </ContenedorDeTabla>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
