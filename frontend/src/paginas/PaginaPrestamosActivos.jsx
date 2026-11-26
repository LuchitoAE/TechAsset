import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarPrestamosActivos } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
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
    <div className="space-y-4">
      <EncabezadoDePagina
        titulo="Préstamos activos"
        descripcion="Equipos que hoy están en manos de un colaborador. Los que pasaron su fecha de devolución se marcan como vencidos."
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
        <div className="rounded-[14px] border border-dashed border-borde bg-superficie p-10 text-center">
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
          <p role="status" className="text-sm font-semibold text-titulo">
            {pagina.total} {pagina.total === 1 ? 'activo' : 'activos'}
            {vencidos > 0 && <span className="text-error"> · {vencidos} vencen hoy o antes</span>}
          </p>

          <div className="hidden sm:block">
            <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
              <caption className="sr-only">
                Préstamos activos con su equipo, colaborador y fecha de devolución comprometida
              </caption>
              <thead>
                <tr className="text-[11px] tracking-wide text-texto-suave uppercase">
                  <th scope="col" className="rounded-l-lg bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Equipo
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Colaborador
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Prestado
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Devuelve
                  </th>
                  <th scope="col" className="bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="rounded-r-lg bg-encabezado-tabla px-4 py-2.5 font-semibold">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagina.prestamos.map((prestamo) => (
                  <tr key={prestamo.id_prestamo} className="group">
                    <th
                      scope="row"
                      className="rounded-l-lg border-y border-l border-borde bg-superficie px-4 py-3.5 font-normal group-hover:bg-superficie-tenue"
                    >
                      <span className="block font-mono text-[11px] font-semibold text-texto-suave">
                        {prestamo.codigo_patrimonial_equipo}
                      </span>
                      <span className="block font-semibold text-texto">{prestamo.nombre_equipo}</span>
                    </th>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 group-hover:bg-superficie-tenue">
                      <span className="block text-texto">{prestamo.nombre_responsable}</span>
                      <span className="block text-xs text-texto-suave">{prestamo.area_responsable}</span>
                    </td>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 text-texto-suave group-hover:bg-superficie-tenue">
                      {formatearFecha(prestamo.fecha_prestamo)}
                    </td>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 font-semibold text-texto group-hover:bg-superficie-tenue">
                      {formatearFecha(prestamo.fecha_devolucion)}
                    </td>
                    <td className="border-y border-borde bg-superficie px-4 py-3.5 group-hover:bg-superficie-tenue">
                      <EtiquetaDeEstadoPrestamo
                        estado={prestamo.estado_prestamo}
                        vencido={prestamo.vencido_prestamo}
                        variante="punto"
                      />
                    </td>
                    <td className="rounded-r-lg border-y border-r border-borde bg-superficie px-4 py-3.5 group-hover:bg-superficie-tenue">
                      <Link
                        to={`/prestamos/${prestamo.id_prestamo}`}
                        className="inline-flex h-9 items-center rounded-lg bg-marca-700 px-3 text-xs font-bold text-sobre-marca transition-colors hover:bg-marca-800"
                      >
                        Devolver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 sm:hidden">
            {pagina.prestamos.map((prestamo) => (
              <li
                key={prestamo.id_prestamo}
                className={`rounded-[14px] border bg-superficie p-4 ${
                  prestamo.vencido_prestamo ? 'border-error/40' : 'border-borde'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-semibold text-texto-suave">
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
                    variante="punto"
                  />
                </div>
                <div className="mt-3 text-right">
                  <Link
                    to={`/prestamos/${prestamo.id_prestamo}`}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-marca-700"
                  >
                    Devolver →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
