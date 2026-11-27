import { Link } from 'react-router'
import MarcaTechAsset from '../components/marca/MarcaTechAsset'
import PanelDeMuestra from '../components/landing/PanelDeMuestra'
import {
  IlustracionInventario,
  IlustracionPrestamos,
  IlustracionReportes,
} from '../components/landing/Ilustraciones'
import { VERSION_DEL_PRODUCTO } from '../reglas/version'
import { useTituloDePagina } from '../utils/titulo'

// Landing pública de TechAsset: la primera pantalla del sistema. Explica qué hace el producto y lleva
// al ingreso; no muestra datos reales ni numeración de requisitos.
const ENLACES = [
  { destino: '#caracteristicas', texto: 'Características' },
  { destino: '#como-funciona', texto: 'Cómo funciona' },
  { destino: '#reportes', texto: 'Reportes' },
]

const CIFRAS = [
  ['128', 'equipos registrados'],
  ['96', 'disponibles hoy'],
  ['24', 'préstamos activos'],
  ['6', 'indicadores en el panel'],
]

const CARACTERISTICAS = [
  {
    id: 'inventario',
    titulo: 'Inventario vivo',
    texto:
      'Cada equipo con su código patrimonial único, categoría, marca y estado. Se acabó perder equipos en planillas.',
    dato: '128 equipos · 7 categorías',
    Ilustracion: IlustracionInventario,
  },
  {
    id: 'prestamos',
    titulo: 'Préstamos controlados',
    texto:
      'El colaborador solicita, el responsable aprueba y el sistema impide prestar lo que está en mantenimiento o ya prestado.',
    dato: '24 préstamos activos',
    Ilustracion: IlustracionPrestamos,
  },
  {
    id: 'reportes',
    titulo: 'Reportes al instante',
    texto:
      'Equipos por estado, más utilizados, préstamos por área y movimientos históricos, sin armar tablas a mano.',
    dato: '6 indicadores · 4 reportes',
    Ilustracion: IlustracionReportes,
  },
]

const PASOS = [
  {
    titulo: 'Ingrese con su correo',
    texto:
      'Su cuenta corporativa identifica su rol: colaborador, responsable de tecnología o administrador.',
  },
  {
    titulo: 'Solicite o apruebe equipos',
    texto:
      'El colaborador pide el equipo con fecha de devolución; el responsable aprueba y el estado queda registrado.',
  },
  {
    titulo: 'Devuelva con observaciones',
    texto:
      'La devolución cierra el préstamo, libera el equipo y deja todo en el historial de movimientos.',
  },
]

const CLASE_PRIMARIO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-marca-700 px-6 text-base font-bold text-sobre-marca transition-colors hover:bg-marca-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco'
const CLASE_SECUNDARIO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde-fuerte bg-superficie px-6 text-base font-semibold text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco'

export default function PaginaLanding() {
  useTituloDePagina('Inventario y préstamos de equipos')

  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-marca-700"
      >
        Ir al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-borde bg-superficie/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center gap-6 px-6 lg:px-12">
          <Link to="/" className="shrink-0 rounded-lg" aria-label="TechAsset, inicio">
            <MarcaTechAsset alto={40} />
          </Link>

          <nav aria-label="Secciones de la página" className="ml-auto hidden items-center gap-8 md:flex">
            {ENLACES.map(({ destino, texto }) => (
              <a
                key={destino}
                href={destino}
                className="inline-flex min-h-6 items-center rounded py-1 text-[15px] font-semibold text-texto-suave hover:text-texto"
              >
                {texto}
              </a>
            ))}
          </nav>

          <Link to="/ingreso" className={`${CLASE_PRIMARIO} ml-auto md:ml-0`}>
            Ingresar
          </Link>
        </div>
      </header>

      <main id="contenido-principal" tabIndex={-1} className="flex-1 focus:outline-none">
        <section className="fondo-reticula border-b border-borde/60 bg-fondo">
          <div className="mx-auto grid w-full max-w-[1440px] items-center gap-12 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-12 lg:py-24">
            <div>
              <p className="text-xs font-bold tracking-[0.08em] text-marca-700 uppercase">
                Gerencia de Tecnología · Innovatech
              </p>
              <h1 className="mt-4 max-w-[700px] text-[2.5rem] leading-[1.06] font-bold tracking-tight text-titulo sm:text-[2.875rem]">
                Inventario y préstamos de equipos, sin hojas de cálculo.
              </h1>
              <p className="mt-6 max-w-[640px] text-lg leading-relaxed text-texto-suave">
                TechAsset registra cada equipo, controla quién lo lleva y cuándo debe volver, y entrega
                indicadores en tiempo real a la Gerencia de Tecnología.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/ingreso" className={CLASE_PRIMARIO}>
                  Ingresar al sistema
                </Link>
                <a href="#caracteristicas" className={CLASE_SECUNDARIO}>
                  Conocer más
                </a>
              </div>

              <p className="mt-6 text-sm text-texto-suave">
                Solo para colaboradores de Innovatech. Su correo corporativo le da acceso.
              </p>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-marca-50/60"
              />
              <div aria-hidden="true">
                <PanelDeMuestra />
              </div>
              <p className="sr-only">
                Vista previa del panel de TechAsset: 128 equipos, 96 disponibles y 24 prestados, con una
                tabla de inventario y el estado de cada equipo.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="TechAsset en cifras" className="fondo-reticula-oscura">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 sm:grid-cols-4 lg:px-12">
            {CIFRAS.map(([valor, etiqueta]) => (
              <div key={etiqueta}>
                <p className="text-3xl leading-none font-bold text-marca-400">{valor}</p>
                <p className="mt-2 text-sm text-tinta-suave">{etiqueta}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="caracteristicas"
          aria-labelledby="titulo-caracteristicas"
          className="scroll-mt-24 border-b border-borde/60 bg-fondo"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-12 lg:py-20">
            <p className="text-xs font-bold tracking-[0.08em] text-marca-700 uppercase">
              Por qué TechAsset
            </p>
            <h2
              id="titulo-caracteristicas"
              className="mt-3 max-w-[900px] text-[2.125rem] leading-tight font-bold tracking-tight text-titulo"
            >
              Todo el ciclo del equipo, en un solo lugar
            </h2>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {CARACTERISTICAS.map(({ id, titulo, texto, dato, Ilustracion }) => (
                <article
                  key={id}
                  id={id}
                  className="scroll-mt-24 rounded-2xl border border-borde bg-superficie p-6"
                >
                  <div aria-hidden="true" className="overflow-hidden rounded-xl">
                    <Ilustracion />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-titulo">{titulo}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-texto-suave">{texto}</p>
                  <p className="mt-5 border-t border-borde pt-4 text-xs font-semibold text-marca-700">
                    {dato}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          aria-labelledby="titulo-pasos"
          className="scroll-mt-24 border-b border-borde/60 bg-fondo"
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-12 lg:py-20">
            <p className="text-xs font-bold tracking-[0.08em] text-marca-700 uppercase">
              Cómo funciona
            </p>
            <h2
              id="titulo-pasos"
              className="mt-3 max-w-[900px] text-[2.125rem] leading-tight font-bold tracking-tight text-titulo"
            >
              De la solicitud a la devolución en tres pasos
            </h2>

            <ol aria-label="Pasos del flujo" className="mt-12 grid gap-6 lg:grid-cols-3">
              {PASOS.map(({ titulo, texto }, indice) => (
                <li key={titulo} className="rounded-2xl border border-borde bg-superficie p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-marca-700 text-lg font-bold text-sobre-marca">
                    <span aria-hidden="true">{indice + 1}</span>
                    <span className="sr-only">Paso {indice + 1}</span>
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-titulo">{titulo}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-texto-suave">{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="titulo-cierre" className="fondo-reticula-oscura">
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-6 py-20 text-center">
            <h2 id="titulo-cierre" className="text-[2.25rem] leading-tight font-bold tracking-tight text-white">
              Empiece a controlar los equipos hoy
            </h2>
            <p className="mt-4 text-base text-tinta-suave">
              Un sistema para el inventario, los préstamos y los reportes de Innovatech.
            </p>
            <Link to="/ingreso" className={`${CLASE_PRIMARIO} mt-9 min-h-14 min-w-80 text-lg`}>
              Ingresar al sistema
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-tinta">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_0.8fr] lg:px-12">
          <div>
            <MarcaTechAsset alto={36} tema="oscuro" />
            <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-tinta-suave">
              Sistema de gestión de inventario y préstamo de equipos tecnológicos de Innovatech Solutions
              S.A.C.
            </p>
          </div>

          <nav aria-labelledby="pie-producto">
            <p id="pie-producto" className="text-xs font-bold tracking-[0.08em] text-marca-400 uppercase">
              Producto
            </p>
            <ul className="mt-4 space-y-2 text-sm text-tinta-suave">
              {ENLACES.map(({ destino, texto }) => (
                <li key={destino}>
                  <a href={destino} className="inline-flex min-h-6 items-center py-1 hover:text-white">
                    {texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-bold tracking-[0.08em] text-marca-400 uppercase">Empresa</p>
            <p className="mt-4 text-sm text-tinta-suave">Innovatech Solutions S.A.C.</p>
            <p className="mt-2 text-sm text-tinta-suave">Gerencia de Tecnología</p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-tinta-suave lg:px-12">
            <p>© 2026 Innovatech Solutions S.A.C. · TechAsset</p>
            <p>
              Construcción de Software · Universidad Peruana Los Andes · versión {VERSION_DEL_PRODUCTO}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
