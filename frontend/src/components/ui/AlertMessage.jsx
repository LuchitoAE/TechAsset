import { unirClases } from '../../utils/clases'

const TIPOS = {
  exito: {
    clases: 'border-exito/30 bg-exito-fondo text-exito',
    icono: '✓',
    role: 'status',
  },
  error: {
    clases: 'border-error/30 bg-error-fondo text-error',
    icono: '!',
    role: 'alert',
  },
  aviso: {
    clases: 'border-aviso/30 bg-aviso-fondo text-aviso',
    icono: '!',
    role: 'status',
  },
  informacion: {
    clases: 'border-marca-300/40 bg-marca-50 text-marca-800',
    icono: 'i',
    role: 'status',
  },
}

// Mensaje en línea con el color y el ícono de su tipo. No mueve el contenido de la pantalla.
export default function AlertMessage({ tipo = 'informacion', children, className }) {
  const configuracion = TIPOS[tipo] ?? TIPOS.informacion

  return (
    <div
      role={configuracion.role}
      className={unirClases(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm leading-relaxed',
        configuracion.clases,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-current text-xs font-bold"
      >
        {configuracion.icono}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
