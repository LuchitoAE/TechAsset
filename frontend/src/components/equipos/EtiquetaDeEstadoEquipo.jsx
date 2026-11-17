import { etiquetaDeEstadoEquipo } from '../../reglas/catalogos'

const ESTADOS = {
  Disponible: {
    clases: 'border-exito/30 bg-exito-fondo text-exito',
    icono: '✓',
  },
  Prestado: {
    clases: 'border-marca-300/50 bg-marca-50 text-marca-800',
    icono: '↗',
  },
  Mantenimiento: {
    clases: 'border-aviso/30 bg-aviso-fondo text-aviso',
    icono: '⚙',
  },
  Baja: {
    clases: 'border-error/30 bg-error-fondo text-error',
    icono: '×',
  },
}

// Estado del equipo con color, ícono y nombre (RNF-05). No depende solo del color.
export default function EtiquetaDeEstadoEquipo({ estado }) {
  const configuracion = ESTADOS[estado] ?? {
    clases: 'border-borde bg-superficie-tenue text-texto-suave',
    icono: '·',
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
