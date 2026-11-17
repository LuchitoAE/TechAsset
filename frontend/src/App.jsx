// Pantalla de bienvenida de la iteración 1: presenta el sistema y los tres roles. Sin lógica de negocio.
const ROLES = [
  {
    inicial: 'A',
    nombre: 'Administrador',
    detalle: 'Gestiona usuarios y equipos, supervisa los préstamos y consulta los reportes.',
  },
  {
    inicial: 'R',
    nombre: 'Responsable de Tecnología',
    detalle: 'Registra equipos, aprueba préstamos, registra devoluciones y controla el inventario.',
  },
  {
    inicial: 'C',
    nombre: 'Colaborador',
    detalle: 'Solicita préstamos, consulta su historial y revisa la disponibilidad de equipos.',
  },
]

const AVANCES = [
  ['Análisis', 'ERS y SDD 0100, diagramas y estándares'],
  ['Backend', 'API .NET 10 con arquitectura limpia'],
  ['Frontend', 'React 19, Vite y Tailwind CSS 4'],
]

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <header className="border-b border-borde bg-superficie/90">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-xl bg-marca-700 text-lg font-bold text-white shadow-campo"
            >
              TA
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-titulo">TechAsset</p>
              <p className="text-xs text-texto-suave">Inventario y préstamo de equipos</p>
            </div>
          </div>
          <p className="flex items-center gap-2 rounded-full border border-borde bg-superficie-tenue px-3 py-1.5 text-xs font-medium text-texto-suave">
            <span aria-hidden="true" className="size-2 rounded-full bg-exito" />
            Iteración 1 · esqueleto en construcción
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section aria-labelledby="titulo-bienvenida">
            <p className="text-xs font-semibold tracking-[0.18em] text-marca-600 uppercase">
              Innovatech Solutions S.A.C.
            </p>
            <h1
              id="titulo-bienvenida"
              className="mt-3 text-4xl leading-tight font-bold tracking-tight text-titulo sm:text-5xl"
            >
              Cada equipo, en su lugar.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-texto-suave">
              TechAsset reemplaza las hojas de cálculo por un inventario único y un control claro de los
              préstamos: qué equipo está disponible, quién lo tiene, desde cuándo y qué se devolvió.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-lg bg-acento-suave px-3 py-1.5 text-sm font-medium text-aviso">
                17 requisitos funcionales
              </span>
              <span className="rounded-lg bg-marca-50 px-3 py-1.5 text-sm font-medium text-marca-700">
                11 reglas de negocio
              </span>
              <span className="rounded-lg border border-borde px-3 py-1.5 text-sm font-medium text-texto-suave">
                6 indicadores
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {ROLES.map((rol) => (
                <article
                  key={rol.nombre}
                  className="rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-lg bg-marca-50 text-sm font-bold text-marca-700"
                  >
                    {rol.inicial}
                  </span>
                  <h2 className="mt-3 text-sm font-semibold text-titulo">{rol.nombre}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-texto-suave">{rol.detalle}</p>
                </article>
              ))}
            </div>
          </section>

          <aside aria-labelledby="titulo-estado" className="rounded-2xl border border-borde bg-superficie p-6 shadow-tarjeta">
            <h2 id="titulo-estado" className="text-sm font-semibold tracking-wide text-titulo uppercase">
              Estado del proyecto
            </h2>
            <ul className="mt-5 space-y-4">
              {AVANCES.map(([nombre, detalle]) => (
                <li key={nombre} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-exito-fondo text-xs font-bold text-exito"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-texto">{nombre}</p>
                    <p className="text-xs text-texto-suave">{detalle}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-borde bg-superficie-tenue p-4">
              <p className="text-xs font-semibold text-texto-suave">Comprobación de la API</p>
              <code className="mt-2 block font-mono text-sm text-marca-700">GET /api/salud</code>
              <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                La API responde <code className="font-mono">200</code> con{' '}
                <code className="font-mono">{'{ success, message, data }'}</code>. Swagger se publica solo en
                desarrollo, en <code className="font-mono">/swagger</code>.
              </p>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-texto-suave">
              Los módulos de usuarios, equipos y préstamos llegan en las iteraciones 2 a 5.
            </p>
          </aside>
        </div>
      </main>

      <footer className="border-t border-borde bg-superficie">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs text-texto-suave">
          <p>Universidad Peruana Los Andes · Construcción de Software</p>
          <p>TechAsset · versión 0.1.0 · 2026</p>
        </div>
      </footer>
    </div>
  )
}
