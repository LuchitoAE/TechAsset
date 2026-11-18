import { ESTADOS_EQUIPO } from '../../reglas/catalogos'

// Chips de estado con su conteo. El conteo viene de la API con el resto de filtros aplicados,
// excepto el estado, para que el usuario vea cuántos equipos hay en cada situación.
export default function ChipsDeEstadoEquipo({ conteos = [], seleccionado, total, onSeleccionar }) {
  function contar(estado) {
    return conteos.find((conteo) => conteo.estado_equipo === estado)?.total ?? 0
  }

  const opciones = [{ valor: '', etiqueta: 'Todos', total }, ...ESTADOS_EQUIPO.map((estado) => ({
    ...estado,
    total: contar(estado.valor),
  }))]

  return (
    <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const activo = (seleccionado ?? '') === opcion.valor

        return (
          <button
            key={opcion.valor || 'todos'}
            type="button"
            aria-pressed={activo}
            onClick={() => onSeleccionar(opcion.valor)}
            className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors ${
              activo
                ? 'border-marca-700 bg-marca-700 text-sobre-marca'
                : 'border-borde bg-superficie text-texto-suave hover:border-marca-300 hover:text-texto'
            }`}
          >
            {opcion.etiqueta}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                activo ? 'bg-white/20 text-sobre-marca' : 'bg-superficie-tenue text-texto-suave'
              }`}
            >
              {opcion.total}
            </span>
          </button>
        )
      })}
    </div>
  )
}
