import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useSesion } from '../contextos/contextoDeSesion'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { ContextoDeEncabezado } from '../contextos/contextoDeEncabezado'
import { etiquetaDeRol } from '../reglas/catalogos'
import { menuDelRol } from '../reglas/permisos'
import { VERSION_DEL_PRODUCTO } from '../reglas/version'
import BotonTema from '../components/ui/BotonTema'
import Button from '../components/ui/Button'
import MarcaTechAsset from '../components/marca/MarcaTechAsset'
import IconoDeMenu from '../components/navegacion/IconoDeMenu'

// Etiqueta de la ubicación para rutas que no están en el menú del rol (por ejemplo, una solicitud
// de préstamo del Colaborador, que no tiene la opción «Préstamos»).
const SECCIONES_DE_RUTA = [
  ['/panel', 'Panel'],
  ['/usuarios', 'Usuarios'],
  ['/equipos', 'Equipos'],
  ['/prestamos', 'Préstamos'],
  ['/mis-prestamos', 'Mis préstamos'],
  ['/disponibilidad', 'Disponibilidad'],
  ['/reportes', 'Reportes'],
]

// Estructura común de la aplicación: barra lateral por rol, barra superior con el usuario y el tema,
// y el contenido de cada ruta en <Outlet />. En el teléfono la barra lateral se abre como cajón.
export default function LayoutPrincipal() {
  const { sesion, cerrarSesion } = useSesion()
  const { mostrarAviso } = useAvisos()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [tituloPagina, setTituloPagina] = useState('')

  const registrarTitulo = useCallback((titulo) => setTituloPagina(titulo ?? ''), [])

  const menu = menuDelRol(sesion?.rol_usuario)
  const iniciales =
    `${sesion?.nombres_usuario?.charAt(0) ?? ''}${sesion?.apellidos_usuario?.charAt(0) ?? ''}`.toUpperCase() ||
    'T'

  const opcionDelMenu = menu.find(
    (opcion) => ubicacion.pathname === opcion.ruta || ubicacion.pathname.startsWith(`${opcion.ruta}/`),
  )
  const seccionActual =
    opcionDelMenu?.etiqueta ??
    SECCIONES_DE_RUTA.find(
      ([ruta]) => ubicacion.pathname === ruta || ubicacion.pathname.startsWith(`${ruta}/`),
    )?.[1] ??
    'Panel'

  // Escape cierra el cajón del teléfono y devuelve el foco al botón que lo abrió.
  const botonDelMenu = useRef(null)

  useEffect(() => {
    if (!menuAbierto) return undefined

    function alPresionarTecla(evento) {
      if (evento.key !== 'Escape') return
      setMenuAbierto(false)
      botonDelMenu.current?.focus()
    }

    document.addEventListener('keydown', alPresionarTecla)
    return () => document.removeEventListener('keydown', alPresionarTecla)
  }, [menuAbierto])

  async function salirDeLaSesion() {
    setSaliendo(true)
    await cerrarSesion()
    setSaliendo(false)
    navegar('/ingreso', { replace: true })
    mostrarAviso('Cerró su sesión.')
  }

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  const enlacesDelMenu = (alNavegar) =>
    menu.map((opcion) => (
      <li key={opcion.ruta}>
        <NavLink
          to={opcion.ruta}
          onClick={alNavegar}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors ${
              isActive
                ? 'bg-white/10 font-semibold text-white'
                : 'text-tinta-suave hover:bg-white/5 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <IconoDeMenu
                nombre={opcion.icono}
                className={`size-5 shrink-0 ${isActive ? 'text-marca-400' : ''}`}
              />
              {opcion.etiqueta}
            </>
          )}
        </NavLink>
      </li>
    ))

  return (
    <ContextoDeEncabezado.Provider value={{ registrarTitulo }}>
      <div className="min-h-dvh bg-fondo">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-marca-700"
      >
        Ir al contenido
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/10 bg-tinta lg:flex">
        <div className="flex h-[76px] items-center px-5">
          <Link to="/panel" className="rounded-lg" aria-label="TechAsset, panel">
            <MarcaTechAsset alto={34} tema="oscuro" />
          </Link>
        </div>

        <nav aria-label="Menú principal" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">{enlacesDelMenu(cerrarMenu)}</ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-marca-600 text-xs font-bold text-tinta"
            >
              {iniciales}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {sesion?.nombres_usuario} {sesion?.apellidos_usuario}
              </p>
              <p className="truncate text-[11px] text-tinta-suave">{etiquetaDeRol(sesion?.rol_usuario)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={salirDeLaSesion}
            disabled={saliendo}
            className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-tinta-suave transition-colors hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
              className="size-4"
            >
              <path d="M12.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4.5A1.5 1.5 0 0 0 3 4v12a1.5 1.5 0 0 0 1.5 1.5H11a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
              <path d="M8 10h9M14.5 7.5 17 10l-2.5 2.5" />
            </svg>
            {saliendo ? 'Saliendo…' : 'Salir'}
          </button>

          <p className="mt-2 px-3 text-[10px] leading-relaxed text-tinta-suave">
            TechAsset · versión {VERSION_DEL_PRODUCTO} · 2026
          </p>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-borde bg-superficie/95 backdrop-blur">
          <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              ref={botonDelMenu}
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-borde px-3 text-sm font-semibold text-texto lg:hidden"
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <span aria-hidden="true">☰</span>
              Menú
            </button>

            <Link to="/panel" className="hidden rounded-lg sm:block lg:hidden" aria-label="TechAsset, panel">
              <MarcaTechAsset alto={30} />
            </Link>

            <div className="min-w-0">
              <nav aria-label="Ubicación" className="hidden items-center gap-2 text-[12px] text-texto-suave lg:flex">
                <span>TechAsset</span>
                <span aria-hidden="true">/</span>
                <span>{seccionActual}</span>
              </nav>
              <h1 className="truncate text-base leading-tight font-bold tracking-tight text-titulo lg:text-[1.375rem]">
                {tituloPagina || seccionActual}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <BotonTema />

              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full bg-marca-600 text-sm font-bold text-tinta"
                title={`${sesion?.nombres_usuario ?? ''} ${sesion?.apellidos_usuario ?? ''}`}
              >
                {iniciales}
              </span>
            </div>
          </div>
        </header>

        <main
          id="contenido-principal"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1408px] px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>
      </div>

      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar el menú"
            className="absolute inset-0 bg-tinta/60"
            onClick={cerrarMenu}
          />

          <div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="relative flex h-full w-72 max-w-[85%] flex-col bg-tinta shadow-tarjeta"
          >
            <div className="flex h-[76px] items-center justify-between px-5">
              <MarcaTechAsset alto={32} tema="oscuro" />
              <button
                type="button"
                autoFocus
                onClick={cerrarMenu}
                className="grid size-10 place-items-center rounded-lg text-xl text-tinta-suave hover:bg-white/5 hover:text-white"
                aria-label="Cerrar el menú"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <nav aria-label="Menú principal en el teléfono" className="flex-1 overflow-y-auto px-3 py-2">
              <ul className="space-y-1">{enlacesDelMenu(cerrarMenu)}</ul>
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
              <p className="truncate text-sm font-semibold text-white">
                {sesion?.nombres_usuario} {sesion?.apellidos_usuario}
              </p>
              <p className="text-[11px] text-tinta-suave">{etiquetaDeRol(sesion?.rol_usuario)}</p>
              <Button
                variante="secundario"
                onClick={salirDeLaSesion}
                cargando={saliendo}
                className="mt-3 w-full"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ContextoDeEncabezado.Provider>
  )
}
