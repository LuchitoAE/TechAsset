import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarPrestamos } from '../api/prestamosApi'
import { obtenerIndicadores } from '../api/reportesApi'
import AlertMessage from '../components/ui/AlertMessage'
import Cargando from '../components/ui/Cargando'
import CardIndicador from '../components/ui/CardIndicador'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import IconoDeMenu from '../components/navegacion/IconoDeMenu'
import { useSesion } from '../contextos/contextoDeSesion'
import { etiquetaDeRol, etiquetaDeEstadoPrestamo } from '../reglas/catalogos'
import { puedeGestionarEquipos } from '../reglas/permisos'
import { distribucionDelInventario, formatearFechaYHora, resumenDeAreas } from '../reglas/reportes'

const COLOR_DE_ESTADO = {
  Solicitado: 'bg-aviso-vivo',
  Activo: 'bg-marca-600',
  Devuelto: 'bg-exito-vivo',
  Rechazado: 'bg-error-vivo',
}

// RF-13 y D-10: panel general con los seis indicadores mínimos del PDF, la distribución del inventario
// y los últimos préstamos. Los tres roles entran; el Colaborador ve los contadores del inventario y
// solo sus préstamos, porque la API aplica el alcance.
export default function PaginaInicio() {
  const { sesion } = useSesion()
  const esColaborador = sesion?.rol_usuario === 'Colaborador'
  const puedeRegistrarEquipos = puedeGestionarEquipos(sesion?.rol_usuario)

  const [indicadores, setIndicadores] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  const [recientes, setRecientes] = useState([])
  const [cargandoRecientes, setCargandoRecientes] = useState(true)
  const [errorRecientes, setErrorRecientes] = useState(null)
  const [recargaRecientes, setRecargaRecientes] = useState(0)

  useEffect(() => {
    const control = new AbortController()

    obtenerIndicadores(control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setIndicadores(datos)
        setError(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setError(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false)
      })

    return () => control.abort()
  }, [recarga])

  useEffect(() => {
    const control = new AbortController()

    listarPrestamos({ pagina: 1, tamano: 3 }, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setRecientes(datos.prestamos ?? [])
        setErrorRecientes(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setErrorRecientes(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargandoRecientes(false)
      })

    return () => control.abort()
  }, [recargaRecientes])

  const total = indicadores?.total_equipos ?? 0
  const distribucion = distribucionDelInventario(indicadores)
  const areas = indicadores?.areas_con_mayor_uso ?? []

  const porcentaje = (valor) => (total === 0 ? 0 : Math.round((Number(valor) / total) * 100))

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo="Panel general"
        descripcion={`Hola, ${sesion?.nombres_usuario ?? ''} · ${etiquetaDeRol(
          sesion?.rol_usuario,
        )}${indicadores ? ` · datos al ${formatearFechaYHora(indicadores.fecha_corte)}` : ''}`}
      />

      {error && (
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
      )}

      {esColaborador && (
        <AlertMessage tipo="informacion">
          Los contadores del inventario son de toda la empresa. El total de préstamos y el área con
          mayor uso son solo suyos.
        </AlertMessage>
      )}

      <section aria-label="Indicadores del panel">
        {cargando ? (
          <div aria-busy="true">
            <Cargando texto="Calculando los indicadores…" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="false">
            <CardIndicador
              etiqueta="Total de equipos"
              valor={total}
              icono={<IconoDeMenu nombre="equipos" />}
            />
            <CardIndicador
              etiqueta="Equipos disponibles"
              valor={indicadores?.equipos_disponibles ?? 0}
              nota={`${porcentaje(indicadores?.equipos_disponibles)} % del total`}
              icono={<IconoDeMenu nombre="disponibilidad" />}
            />
            <CardIndicador
              etiqueta="Equipos prestados"
              valor={indicadores?.equipos_prestados ?? 0}
              nota={`${porcentaje(indicadores?.equipos_prestados)} % del total`}
              icono={<IconoDeMenu nombre="prestamos" />}
            />
            <CardIndicador
              etiqueta="En mantenimiento"
              valor={indicadores?.equipos_mantenimiento ?? 0}
              nota={`${porcentaje(indicadores?.equipos_mantenimiento)} % del total`}
              icono={<IconoDeMenu nombre="mantenimiento" />}
            />
            <CardIndicador
              etiqueta="Total de préstamos"
              valor={indicadores?.total_prestamos ?? 0}
              nota={esColaborador ? 'Solo los suyos' : 'Activos y devueltos'}
              notaClassName="text-texto-suave"
              icono={<IconoDeMenu nombre="prestamos" />}
            />
            <CardIndicador
              etiqueta="Área con mayor uso"
              valor={resumenDeAreas(areas)}
              valorClassName="text-xl"
              nota={areas.length > 0 ? 'Con más préstamos' : undefined}
              notaClassName="text-texto-suave"
              icono={<IconoDeMenu nombre="reportes" />}
            />
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section
          aria-labelledby="titulo-distribucion"
          className="rounded-[14px] border border-borde bg-superficie p-5"
        >
          <h2 id="titulo-distribucion" className="text-[17px] font-bold text-titulo">
            Distribución del inventario
          </h2>

          {total === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-borde px-4 py-6 text-center text-sm text-texto-suave">
              <p>Todavía no hay equipos registrados. Regístrelos desde Equipos para ver la distribución.</p>
              {puedeRegistrarEquipos && (
                <Link
                  to="/equipos/nuevo"
                  className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca hover:bg-marca-800"
                >
                  Registrar el primer equipo
                </Link>
              )}
            </div>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="mt-5 flex h-7 overflow-hidden rounded-[6px] bg-superficie-tenue"
              >
                {distribucion.map((fila) => (
                  <div
                    key={fila.etiqueta}
                    className={fila.clase}
                    style={{ width: `${fila.porcentaje}%` }}
                  />
                ))}
              </div>

              <ul className="mt-5 space-y-2">
                {distribucion.map((fila) => (
                  <li key={fila.etiqueta} className="flex items-center gap-2.5 text-[13px]">
                    <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${fila.clase}`} />
                    <span className="font-semibold text-texto">
                      {fila.etiqueta} · {fila.porcentaje} %
                    </span>
                    <span className="ml-auto text-texto-suave">
                      {fila.valor} {fila.valor === 1 ? 'equipo' : 'equipos'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section
          aria-labelledby="titulo-recientes"
          className="rounded-[14px] border border-borde bg-superficie p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="titulo-recientes" className="text-[17px] font-bold text-titulo">
              Préstamos recientes
            </h2>
            <Link
              to={esColaborador ? '/mis-prestamos' : '/prestamos'}
              className="inline-flex min-h-6 items-center rounded py-1 text-[13px] font-semibold text-marca-700 hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {cargandoRecientes ? (
            <div aria-busy="true">
              <Cargando texto="Consultando los últimos préstamos…" />
            </div>
          ) : errorRecientes ? (
            <AlertMessage tipo="error">
              {errorRecientes}{' '}
              <button
                type="button"
                onClick={() => {
                  setCargandoRecientes(true)
                  setRecargaRecientes((actual) => actual + 1)
                }}
                className="font-semibold underline underline-offset-2"
              >
                Reintentar
              </button>
            </AlertMessage>
          ) : recientes.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-borde px-4 py-5 text-center text-sm text-texto-suave">
              Todavía no hay préstamos registrados.
            </p>
          ) : (
            <table className="mt-4 w-full text-left text-[13px]">
              <caption className="sr-only">Los tres préstamos más recientes</caption>
              <thead>
                <tr className="text-[11px] font-semibold tracking-wide text-texto-suave uppercase">
                  <th scope="col" className="pb-2 font-semibold">
                    Equipo
                  </th>
                  <th scope="col" className="hidden pb-2 font-semibold sm:table-cell">
                    Colaborador
                  </th>
                  <th scope="col" className="pb-2 font-semibold">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((prestamo) => (
                  <tr
                    key={prestamo.id_prestamo}
                    className="border-t border-borde transition-colors hover:bg-superficie-tenue"
                  >
                    <td className="py-3 pr-2 font-semibold text-titulo">
                      <Link to={`/prestamos/${prestamo.id_prestamo}`} className="hover:underline">
                        {prestamo.nombre_equipo}
                      </Link>
                    </td>
                    <td className="hidden py-3 pr-2 text-texto-suave sm:table-cell">
                      {prestamo.nombre_responsable}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-titulo">
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${
                            COLOR_DE_ESTADO[prestamo.estado_prestamo] ?? 'bg-texto-suave'
                          }`}
                        />
                        {etiquetaDeEstadoPrestamo(prestamo.estado_prestamo)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

    </div>
  )
}
