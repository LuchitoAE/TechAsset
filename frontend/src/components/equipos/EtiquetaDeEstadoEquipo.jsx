import { etiquetaDeEstadoEquipo } from '../../reglas/catalogos'

const ESTADOS = {
  Disponible: {
    clases: 'border-exito/30 bg-exito-fondo text-exito',
    punto: 'bg-exito-vivo',
    icono: '✓',
  },
  Prestado: {
    clases: 'border-marca-300/50 bg-marca-50 text-marca-800',
    punto: 'bg-marca-600',
    icono: '↗',
  },
  Mantenimiento: {
    clases: 'border-aviso/30 bg-aviso-fondo text-aviso',
    punto: 'bg-aviso-vivo',
    icono: '⚙',
  },
  Baja: {
    clases: 'border-error/30 bg-error-fondo text-error',
    punto: 'bg-error-vivo',
    icono: '×',
  },
}

// Estado del equipo con color, ícono y nombre (RNF-05). Nunca depende solo del color. En las tablas
// se usa la variante «punto» para acompañar el diseño; en tarjetas, la pastilla con ícono.
export default function EtiquetaDeEstadoEquipo({ estado, variante = 'pastilla' }) {
  const configuracion = ESTADOS[estado] ?? {
    clases: 'border-borde bg-superficie-tenue text-texto-suave',
    punto: 'bg-texto-suave',
    icono: '·',
  }

  if (variante === 'punto') {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-titulo">
        <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${configuracion.punto}`} />
        {etiquetaDeEstadoEquipo(estado)}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${configuracion.clases}`}
    >
      <span aria-hidden="true" className="text-[11px] leading-none">
        {configuracion.icono}
      </span>
      {etiquetaDeEstadoEquipo(estado)}
    </span>
  )
}
