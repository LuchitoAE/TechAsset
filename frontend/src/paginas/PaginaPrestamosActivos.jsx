import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarPrestamosActivos } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import MigasDePan from '../components/ui/MigasDePan'
import EtiquetaDeEstadoPrestamo from '../components/prestamos/EtiquetaDeEstadoPrestamo'
import { formatearFecha } from '../utils/fechas'

const PAGINA_VACIA = { total: 0, pagina: 1, tamano: 50, prestamos: [] }

// RF-12: préstamos activos con la fecha de devolución comprometida; los vencidos se resaltan y se
// ofrece la devolución. Solo lo ven el Responsable de Tecnología y el Administrador.
export default function PaginaPrestamosActivos() {
  const [pagina, setPagina] = useState(PAGINA_VACIA)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const control = new AbortController()

    listarPrestamosActivos({ tamano: 100 }, control.signal)
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
  }, [intento])

  const vencidos = pagina.prestamos.filter((prestamo) => prestamo.vencido_prestamo).length

  return (
    <div className="space-y-6">
      <MigasDePan
        items={[
          { etiqueta: 'Inicio', ruta: '/' },
          { etiqueta: 'Préstamos', ruta: '/prestamos' },
          { etiqueta: 'Préstamos activos' },
        ]}
      />

      <EncabezadoDePagina
        titulo="Préstamos activos"
        descripcion="Equipos que hoy están en manos de un colaborador. Los que ya pasaron su fecha de devolución comprometida se marcan como vencidos."
      />

      {error && (
        <AlertMessage tipo="error">
          {error}{' '}
          <Button
            variante="fantasma"
            onClick={() => {
              setCargando(true)
              setIntento((actual) => actual + 1)
            }}
          >
            Reintentar
          </Button>
        </AlertMessage>
      )}

      {cargando ? (
        <div aria-busy="true">
          <Cargando texto="Consultando los préstamos activos…" />
        </div>
      ) : pagina.prestamos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">No hay préstamos activos.</p>
          <p className="mt-1 text-sm text-texto-suave">
            Cuando se apruebe una solicitud, el préstamo aparecerá aquí hasta que se registre la
            devolución.
          </p>
          <Link
            to="/prestamos"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-borde-fuerte bg-superficie px-4 text-sm font-semibold text-texto hover:bg-superficie-tenue"
          >
            Ver todo el historial
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-texto-suave">
            {pagina.total} {pagina.total === 1 ? 'préstamo activo' : 'préstamos activos'}
            {vencidos > 0 && (
              <span className="font-semibold text-error"> · {vencidos} vencido(s)</span>
            )}
          </p>

          <div className="overflow-hidden rounded-2xl border border-borde bg-superficie shadow-tarjeta">
            <table className="hidden w-full border-collapse text-left text-sm sm:table">
              <caption className="sr-only">
                Préstamos activos con su equipo, responsable y fecha de devolución comprometida
              </caption>
              <thead className="bg-superficie-tenue text-xs tracking-wide text-texto-suave uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Equipo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Responsable
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Prestado el
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Devolver hasta
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
                {pagina.prestamos.map((prestamo) => (
                  <tr
                    key={prestamo.id_prestamo}
                    className={prestamo.vencido_prestamo ? 'bg-error-fondo/40' : 'hover:bg-superficie-tenue'}
                  >
                    <th scope="row" className="px-4 py-3 font-normal">
                      <span className="block font-mono text-xs font-semibold text-texto">
                        {prestamo.codigo_patrimonial_equipo}
                      </span>
                      <span className="block text-sm text-texto-suave">{prestamo.nombre_equipo}</span>
                    </th>
                    <td className="px-4 py-3">
                      <span className="block text-texto">{prestamo.nombre_responsable}</span>
                      <span className="block text-xs text-texto-suave">{prestamo.area_responsable}</span>
                    </td>
                    <td className="px-4 py-3 text-texto-suave">
                      {formatearFecha(prestamo.fecha_prestamo)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-texto">
                      {formatearFecha(prestamo.fecha_devolucion)}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaDeEstadoPrestamo estado={prestamo.estado_prestamo} vencido={prestamo.vencido_prestamo} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/prestamos/${prestamo.id_prestamo}`}
                        className="inline-flex min-h-11 items-center rounded px-2 text-sm font-semibold text-marca-700 hover:bg-marca-50"
                      >
                        Registrar devolución
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-borde sm:hidden">
              {pagina.prestamos.map((prestamo) => (
                <li
                  key={prestamo.id_prestamo}
                  className={`p-4 ${prestamo.vencido_prestamo ? 'bg-error-fondo/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-texto">
                        {prestamo.codigo_patrimonial_equipo}
                      </p>
                      <p className="truncate text-sm font-semibold text-texto">{prestamo.nombre_equipo}</p>
                      <p className="truncate text-xs text-texto-suave">
                        {prestamo.nombre_responsable} · {prestamo.area_responsable}
                      </p>
                      <p className="mt-1 text-xs text-texto-suave">
                        Devolver hasta {formatearFecha(prestamo.fecha_devolucion)}
                      </p>
                    </div>
                    <EtiquetaDeEstadoPrestamo
                      estado={prestamo.estado_prestamo}
                      vencido={prestamo.vencido_prestamo}
                    />
                  </div>
                  <div className="mt-3 text-right">
                    <Link
                      to={`/prestamos/${prestamo.id_prestamo}`}
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-marca-700"
                    >
                      Registrar devolución
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right">
            <Link to="/prestamos" className="text-sm font-semibold text-marca-700">
              Ver todo el historial
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
