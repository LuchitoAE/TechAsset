import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { listarPrestamos } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import EtiquetaDeEstadoPrestamo from '../components/prestamos/EtiquetaDeEstadoPrestamo'
import FiltrosPrestamos from '../components/prestamos/FiltrosPrestamos'
import { useSesion } from '../contextos/contextoDeSesion'
import { puedeGestionarPrestamos, puedeSolicitarPrestamos } from '../reglas/permisos'
import { formatearFecha } from '../utils/fechas'

const FILTROS_VACIOS = {
  texto: '',
  estado: '',
  area: '',
  desde: '',
  hasta: '',
  pagina: 1,
  tamano: 20,
}
const PAGINA_VACIA = { total: 0, pagina: 1, tamano: 20, prestamos: [] }

// RF-11: historial de préstamos con filtros. El Colaborador ve solo los suyos (la API aplica el
// alcance); el Responsable y el Administrador ven todo el historial.
export default function PaginaPrestamos({ soloMisPrestamos = false }) {
  const { sesion } = useSesion()
  const ubicacion = useLocation()
  const gestiona = puedeGestionarPrestamos(sesion?.rol_usuario)
  const solicita = puedeSolicitarPrestamos(sesion?.rol_usuario)

  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS)
  const [pagina, setPagina] = useState(PAGINA_VACIA)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(ubicacion.state?.aviso ?? null)

  useEffect(() => {
    const control = new AbortController()

    listarPrestamos(aplicados, control.signal)
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
    setAviso(null)
    setCargando(true)
    setAplicados({ ...filtros, pagina: 1 })
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS)
    setCargando(true)
    setAplicados(FILTROS_VACIOS)
    setAviso(null)
  }

  function irAPagina(numero) {
    setCargando(true)
    setAplicados((actuales) => ({ ...actuales, pagina: numero }))
  }

  const totalPaginas = Math.max(1, Math.ceil(pagina.total / (pagina.tamano || 20)))
  const titulo = soloMisPrestamos ? 'Mis préstamos' : 'Préstamos'

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo={titulo}
        descripcion={
          gestiona
            ? 'Solicitudes, préstamos activos e historial. El responsable de cada préstamo es el colaborador que lo recibió.'
            : 'Sus solicitudes y el historial de los equipos que usó. El Responsable de Tecnología decide cada solicitud.'
        }
        acciones={
          <>
            {solicita && (
              <Link
                to="/prestamos/nuevo"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca transition-colors hover:bg-marca-800"
              >
                Solicitar préstamo
              </Link>
            )}
            {gestiona && (
              <Link
                to="/prestamos/activos"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-borde-fuerte bg-superficie px-4 text-sm font-semibold text-texto transition-colors hover:bg-superficie-tenue"
              >
                Préstamos activos
              </Link>
            )}
          </>
        }
      />

      {aviso && <AlertMessage tipo="exito">{aviso}</AlertMessage>}
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

      <FiltrosPrestamos
        filtros={filtros}
        onCambiar={cambiarFiltro}
        onFiltrar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
        cargando={cargando}
        mostrarArea={gestiona}
      />

      {cargando ? (
        <Cargando texto="Consultando los préstamos…" />
      ) : pagina.prestamos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">No hay préstamos con esos filtros.</p>
          <p className="mt-1 text-sm text-texto-suave">
            {solicita
              ? 'Solicite un equipo disponible o cambie los filtros para ver su historial.'
              : 'Cambie el texto, el estado o las fechas, o limpie los filtros para ver todo el historial.'}
          </p>
          <Button variante="secundario" className="mt-4" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-borde bg-superficie shadow-tarjeta">
            <table className="hidden w-full border-collapse text-left text-sm sm:table">
              <caption className="sr-only">
                Historial de préstamos con su equipo, responsable, fechas y estado
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
                    Préstamo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Devolución
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
                  <tr key={prestamo.id_prestamo} className="hover:bg-superficie-tenue">
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
                    <td className="px-4 py-3 text-texto-suave">
                      {formatearFecha(prestamo.fecha_devolucion_real ?? prestamo.fecha_devolucion)}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaDeEstadoPrestamo
                        estado={prestamo.estado_prestamo}
                        vencido={prestamo.vencido_prestamo}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/prestamos/${prestamo.id_prestamo}`}
                        className="rounded px-2 py-1 text-sm font-semibold text-marca-700 hover:bg-marca-50"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-borde sm:hidden">
              {pagina.prestamos.map((prestamo) => (
                <li key={prestamo.id_prestamo} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-texto">
                        {prestamo.codigo_patrimonial_equipo}
                      </p>
                      <p className="truncate text-sm font-semibold text-texto">
                        {prestamo.nombre_equipo}
                      </p>
                      <p className="truncate text-xs text-texto-suave">
                        {prestamo.nombre_responsable} · {prestamo.area_responsable}
                      </p>
                      <p className="mt-1 text-xs text-texto-suave">
                        {formatearFecha(prestamo.fecha_prestamo)} →{' '}
                        {formatearFecha(prestamo.fecha_devolucion_real ?? prestamo.fecha_devolucion)}
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
                      className="text-sm font-semibold text-marca-700"
                    >
                      Ver
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-texto-suave">
            <p>
              {pagina.total} {pagina.total === 1 ? 'préstamo' : 'préstamos'} · página {pagina.pagina}{' '}
              de {totalPaginas}
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
