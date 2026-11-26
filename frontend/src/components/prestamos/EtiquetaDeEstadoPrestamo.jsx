import { etiquetaDeEstadoPrestamo } from '../../reglas/catalogos'

const ESTADOS = {
  Solicitado: {
    clases: 'border-aviso/30 bg-aviso-fondo text-aviso',
    punto: 'bg-aviso-vivo',
    texto: 'text-aviso',
    icono: '…',
  },
  Activo: {
    clases: 'border-marca-300/50 bg-marca-50 text-marca-800',
    punto: 'bg-marca-600',
    texto: 'text-marca-700',
    icono: '↗',
  },
  Devuelto: {
    clases: 'border-exito/30 bg-exito-fondo text-exito',
    punto: 'bg-exito-vivo',
    texto: 'text-exito',
    icono: '✓',
  },
  Rechazado: {
    clases: 'border-error/30 bg-error-fondo text-error',
    punto: 'bg-error-vivo',
    texto: 'text-error',
    icono: '×',
  },
}

// Estado del préstamo con color, ícono y nombre (RNF-05). Nunca depende solo del color. En tablas se
// usa la variante «punto», que se lee mejor que una pastilla en cada fila.
export default function EtiquetaDeEstadoPrestamo({ estado, vencido = false, variante = 'pastilla' }) {
  const configuracion = ESTADOS[estado] ?? {
    clases: 'border-borde bg-superficie-tenue text-texto-suave',
    punto: 'bg-texto-suave',
    texto: 'text-texto-suave',
    icono: '·',
  }

  if (variante === 'punto') {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className={`inline-flex items-center gap-1.5 ${configuracion.texto}`}>
          <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${configuracion.punto}`} />
          {etiquetaDeEstadoPrestamo(estado)}
        </span>
        {vencido && <span className="text-xs font-semibold text-error">Vencido</span>}
      </span>
    )
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${configuracion.clases}`}
      >
        <span aria-hidden="true" className="text-[11px] leading-none">
          {configuracion.icono}
        </span>
        {etiquetaDeEstadoPrestamo(estado)}
      </span>
      {vencido && (
        <span className="inline-flex items-center gap-1 rounded-full border border-error/30 bg-error-fondo px-2.5 py-1 text-xs font-semibold text-error">
          Vencido
        </span>
      )}
    </span>
  )
}
