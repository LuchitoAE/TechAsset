import { iconoDeTipoMovimiento, etiquetaDeTipoMovimiento } from '../../reglas/reportes'

const CONFIGURACION = {
  EquipoRegistrado: 'border-exito/30 bg-exito-fondo text-exito',
  EquipoActualizado: 'border-marca-300/50 bg-marca-50 text-marca-800',
  EquipoEstadoCambiado: 'border-aviso/30 bg-aviso-fondo text-aviso',
  PrestamoSolicitado: 'border-aviso/30 bg-aviso-fondo text-aviso',
  PrestamoAprobado: 'border-marca-300/50 bg-marca-50 text-marca-800',
  PrestamoRechazado: 'border-error/30 bg-error-fondo text-error',
  PrestamoDevuelto: 'border-exito/30 bg-exito-fondo text-exito',
}

// Tipo de movimiento con ícono, color y nombre (RNF-05): nunca se comunica solo con color.
export default function EtiquetaDeTipoMovimiento({ tipo }) {
  const clases = CONFIGURACION[tipo] ?? 'border-borde bg-superficie-tenue text-texto-suave'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${clases}`}
    >
      <span aria-hidden="true" className="text-[11px] leading-none">
        {iconoDeTipoMovimiento(tipo)}
      </span>
      {etiquetaDeTipoMovimiento(tipo)}
    </span>
  )
}
