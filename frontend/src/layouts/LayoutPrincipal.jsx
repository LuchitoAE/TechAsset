import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useSesion } from '../contextos/contextoDeSesion'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { etiquetaDeRol } from '../reglas/catalogos'
import { menuDelRol } from '../reglas/permisos'
import { VERSION_DEL_PRODUCTO } from '../reglas/version'
import BotonTema from '../components/ui/BotonTema'
import Button from '../components/ui/Button'
import MarcaTechAsset from '../components/marca/MarcaTechAsset'

// Estructura común de la aplicación: marca, menú según el rol, tema, sesión y pie. El contenido de
// cada ruta se dibuja en <Outlet />.
export default function LayoutPrincipal() {
  const { sesion, cerrarSesion } = useSesion()
  const { mostrarAviso } = useAvisos()
  const navegar = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  const menu = menuDelRol(sesion?.rol_usuario)
  const inicial = sesion?.nombres_usuario?.charAt(0)?.toUpperCase() ?? 'T'

  // Escape cierra el menú del teléfono y devuelve el foco al botón que lo abrió.
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

  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-marca-700"
      >
        Ir al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-borde bg-superficie/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/panel" className="flex shrink-0 items-center gap-2.5" onClick={cerrarMenu}>
            <MarcaTechAsset alto={36} />
            <span className="hidden text-[11px] leading-tight text-texto-suave sm:block">Innovatech</span>
          </Link>

          <nav aria-label="Menú principal" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {menu.map((opcion) => (
              <NavLink
                key={opcion.ruta}
                to={opcion.ruta}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-marca-50 text-marca-800'
                      : 'text-texto-suave hover:bg-superficie-tenue hover:text-texto'
                  }`
                }
              >
                {opcion.etiqueta}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <BotonTema />
            <div className="text-right">
              <p className="max-w-44 truncate text-sm font-semibold text-texto">
                {sesion?.nombres_usuario} {sesion?.apellidos_usuario}
              </p>
              <p className="text-[11px] text-texto-suave">{etiquetaDeRol(sesion?.rol_usuario)}</p>
            </div>
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full bg-marca-50 text-sm font-bold text-marca-700"
            >
              {inicial}
            </span>
            <Button variante="fantasma" cargando={saliendo} textoCargando="Saliendo…" onClick={salirDeLaSesion}>
              Salir
            </Button>
          </div>

          <button
            ref={botonDelMenu}
            type="button"
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-lg border border-borde px-3 text-sm font-semibold text-texto md:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span aria-hidden="true">☰</span>
            Menú
          </button>
        </div>

        {menuAbierto && (
          <div id="menu-movil" className="border-t border-borde bg-superficie px-4 py-3 md:hidden">
            <nav aria-label="Menú principal en el teléfono" className="grid gap-1">
              {menu.map((opcion) => (
                <NavLink
                  key={opcion.ruta}
                  to={opcion.ruta}
                  onClick={cerrarMenu}
                  className={({ isActive }) =>
                    `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ${
                      isActive ? 'bg-marca-50 text-marca-800' : 'text-texto-suave'
                    }`
                  }
                >
                  {opcion.etiqueta}
                </NavLink>
              ))}
            </nav>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-borde pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-texto">
                  {sesion?.nombres_usuario} {sesion?.apellidos_usuario}
                </p>
                <p className="text-[11px] text-texto-suave">{etiquetaDeRol(sesion?.rol_usuario)}</p>
              </div>
              <div className="flex items-center gap-2">
                <BotonTema />
                <Button variante="secundario" onClick={salirDeLaSesion} cargando={saliendo}>
                  Salir
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main
        id="contenido-principal"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 focus:outline-none sm:px-6 sm:py-8"
      >
        <Outlet />
      </main>

      <footer className="border-t border-borde bg-superficie">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-texto-suave sm:px-6">
          <p>Universidad Peruana Los Andes · Construcción de Software</p>
          <p>TechAsset · versión {VERSION_DEL_PRODUCTO} · 2026</p>
        </div>
      </footer>
    </div>
  )
}
