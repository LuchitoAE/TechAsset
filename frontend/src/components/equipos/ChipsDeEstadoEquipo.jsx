import { ESTADOS_EQUIPO } from '../../reglas/catalogos'

// Conteo por estado como píldoras seleccionables. El conteo llega de la API con el resto de filtros
// aplicados excepto el estado, así que siempre dice cuántos equipos hay en cada situación.
const PUNTOS = {
  Disponible: 'bg-exito-vivo',
  Prestado: 'bg-marca-600',
  Mantenimiento: 'bg-aviso-vivo',
  Baja: 'bg-error-vivo',
}

export default function ChipsDeEstadoEquipo({ conteos = [], seleccionado, onSeleccionar }) {
  function contar(estado) {
    return conteos.find((conteo) => conteo.estado_equipo === estado)?.total ?? 0
  }

  return (
    <div role="group" aria-label="Filtrar por estado" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {ESTADOS_EQUIPO.map((estado) => {
        const activo = (seleccionado ?? '') === estado.valor
        const total = contar(estado.valor)

        return (
          <button
            key={estado.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onSeleccionar(activo ? '' : estado.valor)}
            title={activo ? 'Quitar este filtro' : `Ver solo ${estado.etiqueta.toLowerCase()}`}
            className={`inline-flex h-11 items-center gap-2.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
              activo
                ? 'border-marca-600 bg-marca-50 text-marca-800'
                : 'border-borde bg-superficie text-texto hover:border-marca-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${PUNTOS[estado.valor] ?? 'bg-texto-suave'}`}
            />
            <span className="truncate">
              {estado.etiqueta} · {total}
            </span>
            {activo && (
              <span aria-hidden="true" className="ml-0.5 text-base leading-none">
                ×
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
