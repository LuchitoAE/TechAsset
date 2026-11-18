import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { obtenerIndicadores } from '../api/reportesApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import CardIndicador from '../components/ui/CardIndicador'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import { useSesion } from '../contextos/contextoDeSesion'
import { etiquetaDeRol } from '../reglas/catalogos'
import { accesosDelRol } from '../reglas/permisos'
import { formatearFechaYHora, resumenDeAreas } from '../reglas/reportes'

// RF-13 y D-10: panel general con los seis indicadores mínimos del PDF. Los tres roles entran; el
// Colaborador ve los contadores del inventario y solo sus préstamos, porque la API aplica el alcance.
export default function PaginaInicio() {
  const { sesion } = useSesion()
  const accesos = accesosDelRol(sesion?.rol_usuario)
  const esColaborador = sesion?.rol_usuario === 'Colaborador'

  const [indicadores, setIndicadores] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

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

  const total = indicadores?.total_equipos ?? 0
  const distribucion = [
    { etiqueta: 'Disponibles', valor: indicadores?.equipos_disponibles ?? 0, clase: 'bg-exito' },
    { etiqueta: 'Prestados', valor: indicadores?.equipos_prestados ?? 0, clase: 'bg-marca-600' },
    {
      etiqueta: 'En mantenimiento',
      valor: indicadores?.equipos_mantenimiento ?? 0,
      clase: 'bg-aviso',
    },
  ]

  const areas = indicadores?.areas_con_mayor_uso ?? []

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo={`Hola, ${sesion?.nombres_usuario ?? ''}`}
        descripcion={`Sesión iniciada como ${etiquetaDeRol(sesion?.rol_usuario)}. Este es el panorama de TechAsset${
          indicadores ? ` al ${formatearFechaYHora(indicadores.fecha_corte)}` : ''
        }.`}
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

      <section aria-labelledby="titulo-indicadores" className="space-y-4">
        <h2
          id="titulo-indicadores"
          className="text-sm font-semibold tracking-wide text-texto-suave uppercase"
        >
          Indicadores del panel
        </h2>

        {cargando ? (
          <Cargando texto="Calculando los indicadores…" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <CardIndicador
              etiqueta="Total de equipos"
              valor={total}
              detalle="Suma de Disponibles, Prestados, Mantenimiento y Baja."
            />
            <CardIndicador
              etiqueta="Equipos disponibles"
              valor={indicadores?.equipos_disponibles ?? 0}
              detalle="Listos para solicitar un préstamo."
            />
            <CardIndicador
              etiqueta="Equipos prestados"
              valor={indicadores?.equipos_prestados ?? 0}
              detalle="Con un préstamo activo en este momento."
            />
            <CardIndicador
              etiqueta="En mantenimiento"
              valor={indicadores?.equipos_mantenimiento ?? 0}
              detalle="Fuera de servicio; no se pueden prestar."
            />
            <CardIndicador
              etiqueta="Total de préstamos"
              valor={indicadores?.total_prestamos ?? 0}
              detalle={
                esColaborador
                  ? 'Sus préstamos activos y devueltos.'
                  : 'Préstamos activos y devueltos de la empresa; los rechazados no cuentan.'
              }
            />
            <CardIndicador
              etiqueta="Área con mayor uso"
              valor={resumenDeAreas(areas)}
              valorClassName="text-xl"
              detalle={
                areas.length > 1
                  ? 'Hay un empate: se muestran todas las áreas con el máximo.'
                  : 'Área del responsable con más préstamos contados.'
              }
            />
          </div>
        )}
      </section>

      {!cargando && indicadores && (
        <section
          aria-labelledby="titulo-distribucion"
          className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta"
        >
          <h2 id="titulo-distribucion" className="text-base font-bold text-titulo">
            Distribución del inventario
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Cada barra compara el estado con el total de equipos. El número y el nombre acompañan
            siempre al color.
          </p>

          {total === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-borde px-4 py-6 text-center text-sm text-texto-suave">
              Todavía no hay equipos registrados. Regístrelos desde Equipos para ver la distribución.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {distribucion.map((fila) => {
                const porcentaje = total === 0 ? 0 : Math.round((fila.valor / total) * 100)

                return (
                  <li key={fila.etiqueta}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-texto">{fila.etiqueta}</span>
                      <span className="text-texto-suave">
                        {fila.valor} · {porcentaje} %
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="mt-1 h-2 overflow-hidden rounded-full bg-superficie-tenue"
                    >
                      <div
                        className={`h-full rounded-full ${fila.clase}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="titulo-accesos" className="space-y-4">
        <h2 id="titulo-accesos" className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
          Accesos de su rol
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accesos.map((acceso) => (
            <Link
              key={acceso.ruta}
              to={acceso.ruta}
              className="group rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta transition-colors hover:border-marca-300 hover:bg-superficie-tenue"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-titulo">{acceso.titulo}</h3>
                <span
                  aria-hidden="true"
                  className="text-marca-700 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">{acceso.detalle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <h2 className="text-base font-bold text-titulo">Inventario y préstamos</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
            Altas con código patrimonial único, cambios de estado, solicitudes, aprobaciones y
            devoluciones con observación obligatoria.
          </p>
          <p className="mt-4 rounded-lg bg-exito-fondo px-3 py-2 text-xs font-semibold text-exito">
            Disponible
          </p>
        </article>

        <article className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <h2 className="text-base font-bold text-titulo">Reportes e historial</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
            Equipos por estado, equipos más utilizados, préstamos por área e historial de movimientos,
            con filtros y estados vacíos.
          </p>
          <p className="mt-4 rounded-lg bg-exito-fondo px-3 py-2 text-xs font-semibold text-exito">
            {esColaborador ? 'El panel es suyo; los reportes son del Responsable y del Administrador.' : 'Disponible'}
          </p>
        </article>
      </section>

      {!cargando && !indicadores && !error && (
        <Button variante="secundario" onClick={() => setRecarga((actual) => actual + 1)}>
          Volver a consultar los indicadores
        </Button>
      )}
    </div>
  )
}
