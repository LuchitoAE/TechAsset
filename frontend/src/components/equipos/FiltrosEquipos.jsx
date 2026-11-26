import { Link } from 'react-router'
import { CATEGORIAS_EQUIPO, ESTADOS_EQUIPO } from '../../reglas/catalogos'

// Barra de filtros del inventario (RF-07): búsqueda por texto, estado, categoría y el alta de equipo.
// Los selectores se aplican al cambiar; la búsqueda se envía con Enter o con el botón de la lupa.
export default function FiltrosEquipos({
  filtros,
  onCambiar,
  onFiltrar,
  onLimpiar,
  cargando,
  puedeGestionar,
  hayFiltros,
}) {
  return (
    <search aria-label="Filtros del inventario" className="block">
      <form
        onSubmit={(evento) => {
          evento.preventDefault()
          onFiltrar()
        }}
        className="rounded-[14px] border border-borde bg-superficie p-4"
      >
        <button type="submit" className="sr-only">
          Buscar
        </button>
        <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-texto-suave"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                className="size-4"
              >
                <circle cx="9" cy="9" r="5.5" />
                <path d="m13.2 13.2 3.3 3.3" />
              </svg>
            </span>
            <input
              type="search"
              name="texto"
              value={filtros.texto}
              onChange={onCambiar}
              placeholder="Buscar por código, nombre o marca…"
              aria-label="Buscar por código, nombre o marca"
              autoComplete="off"
              className="h-11 w-full rounded-[10px] border border-borde bg-fondo pr-3 pl-9 text-sm text-texto placeholder:text-texto-suave focus:border-marca-600 focus:ring-2 focus:ring-marca-600/25 focus:outline-none"
            />
          </div>

          <select
            name="estado"
            value={filtros.estado}
            onChange={onCambiar}
            aria-label="Filtrar por estado"
            className="h-11 w-full rounded-[10px] border border-borde bg-fondo px-3 text-sm font-semibold text-texto focus:border-marca-600 focus:ring-2 focus:ring-marca-600/25 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_EQUIPO.map((estado) => (
              <option key={estado.valor} value={estado.valor}>
                {estado.etiqueta}
              </option>
            ))}
          </select>

          <select
            name="categoria"
            value={filtros.categoria}
            onChange={onCambiar}
            aria-label="Filtrar por categoría"
            className="h-11 w-full rounded-[10px] border border-borde bg-fondo px-3 text-sm font-semibold text-texto focus:border-marca-600 focus:ring-2 focus:ring-marca-600/25 focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS_EQUIPO.map((categoria) => (
              <option key={categoria.valor} value={categoria.valor}>
                {categoria.etiqueta}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {hayFiltros && (
              <button
                type="button"
                onClick={onLimpiar}
                disabled={cargando}
                className="h-11 rounded-[10px] px-3 text-sm font-semibold text-texto-suave transition-colors hover:bg-superficie-tenue hover:text-texto disabled:opacity-60"
              >
                Limpiar
              </button>
            )}

            {puedeGestionar && (
              <Link
                to="/equipos/nuevo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-marca-700 px-5 text-sm font-bold whitespace-nowrap text-sobre-marca transition-colors hover:bg-marca-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
              >
                <span aria-hidden="true">+</span>
                Registrar equipo
              </Link>
            )}
          </div>
        </div>
      </form>
    </search>
  )
}
