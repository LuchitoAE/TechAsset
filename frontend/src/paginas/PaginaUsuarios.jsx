import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { listarUsuarios } from '../api/usuariosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import EtiquetaDeEstado from '../components/usuarios/EtiquetaDeEstado'
import EtiquetaDeRol from '../components/usuarios/EtiquetaDeRol'
import FiltrosUsuarios from '../components/usuarios/FiltrosUsuarios'
import { useSesion } from '../contextos/contextoDeSesion'
import { puedeGestionarUsuarios } from '../reglas/permisos'

const FILTROS_VACIOS = { texto: '', rol: '', activo: '', area: '', pagina: 1, tamano: 20 }

// RF-03: listado de usuarios con filtros por texto, rol, estado y área, paginado y con el estado visible.
export default function PaginaUsuarios() {
  const { sesion } = useSesion()
  const ubicacion = useLocation()
  const administrador = puedeGestionarUsuarios(sesion?.rol_usuario)

  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS)
  const [pagina, setPagina] = useState({ total: 0, pagina: 1, tamano: 20, usuarios: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(ubicacion.state?.aviso ?? null)

  useEffect(() => {
    const control = new AbortController()

    listarUsuarios(aplicados, control.signal)
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

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo={administrador ? 'Usuarios' : 'Consulta de usuarios'}
        descripcion={
          administrador
            ? 'Registre, actualice y deshabilite cuentas. El correo es único y solo el Administrador puede deshabilitar usuarios.'
            : 'Consulte las cuentas y sus roles para elegir al responsable de un préstamo. Solo lectura.'
        }
        acciones={
          administrador ? (
            <Link
              to="/usuarios/nuevo"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca transition-colors hover:bg-marca-800"
            >
              Nuevo usuario
            </Link>
          ) : null
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

      <FiltrosUsuarios
        filtros={filtros}
        onCambiar={cambiarFiltro}
        onFiltrar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
        cargando={cargando}
      />

      {cargando ? (
        <Cargando texto="Consultando usuarios…" />
      ) : pagina.usuarios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
          <p className="text-base font-semibold text-titulo">No hay usuarios con esos filtros.</p>
          <p className="mt-1 text-sm text-texto-suave">
            Cambie el texto o el estado, o limpie los filtros para ver toda la lista.
          </p>
          <Button variante="secundario" className="mt-4" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-borde bg-superficie shadow-tarjeta">
            <table className="hidden w-full border-collapse text-left text-sm sm:table">
              <caption className="sr-only">Usuarios de TechAsset con su rol y estado</caption>
              <thead className="bg-superficie-tenue text-xs tracking-wide text-texto-suave uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Correo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Área
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Rol
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
                {pagina.usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario} className="hover:bg-superficie-tenue">
                    <th scope="row" className="px-4 py-3 font-semibold text-texto">
                      {usuario.nombres_usuario} {usuario.apellidos_usuario}
                    </th>
                    <td className="px-4 py-3 text-texto-suave">{usuario.correo_usuario}</td>
                    <td className="px-4 py-3 text-texto-suave">{usuario.area_usuario}</td>
                    <td className="px-4 py-3">
                      <EtiquetaDeRol rol={usuario.rol_usuario} />
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaDeEstado activo={usuario.activo_usuario} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/usuarios/${usuario.id_usuario}`}
                        className="rounded px-2 py-1 text-sm font-semibold text-marca-700 hover:bg-marca-50"
                      >
                        {administrador ? 'Editar' : 'Ver detalle'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-borde sm:hidden">
              {pagina.usuarios.map((usuario) => (
                <li key={usuario.id_usuario} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-texto">
                        {usuario.nombres_usuario} {usuario.apellidos_usuario}
                      </p>
                      <p className="truncate text-xs text-texto-suave">{usuario.correo_usuario}</p>
                      <p className="mt-0.5 text-xs text-texto-suave">{usuario.area_usuario}</p>
                    </div>
                    <EtiquetaDeEstado activo={usuario.activo_usuario} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <EtiquetaDeRol rol={usuario.rol_usuario} />
                    <Link
                      to={`/usuarios/${usuario.id_usuario}`}
                      className="text-sm font-semibold text-marca-700"
                    >
                      {administrador ? 'Editar' : 'Ver detalle'}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-texto-suave">
            <p>
              {pagina.total} {pagina.total === 1 ? 'usuario' : 'usuarios'} · página {pagina.pagina} de{' '}
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
