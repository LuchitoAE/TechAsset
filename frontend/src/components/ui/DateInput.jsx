import CampoBase from './CampoBase'
import { unirClases } from '../../utils/clases'

// Fecha con calendario nativo, etiqueta, ayuda y error en una línea. Se usa en los formularios de
// préstamo (fecha de devolución comprometida).
export default function DateInput({
  id,
  name,
  label,
  error,
  ayuda,
  requerido = false,
  className,
  ...propiedades
}) {
  const idCampo = id ?? name
  const descrito = error ? `${idCampo}-error` : ayuda ? `${idCampo}-ayuda` : undefined

  return (
    <CampoBase id={idCampo} etiqueta={label} requerido={requerido} ayuda={ayuda} error={error}>
      <input
        {...propiedades}
        type="date"
        id={idCampo}
        name={name}
        required={requerido}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={descrito}
        className={unirClases(
          'h-11 w-full rounded-lg border bg-superficie px-3 text-sm text-texto shadow-campo transition-colors',
          'focus:border-marca-600 focus:ring-2 focus:ring-marca-600/25',
          'disabled:cursor-not-allowed disabled:bg-superficie-tenue disabled:text-texto-suave',
          error ? 'border-error' : 'border-borde-fuerte',
          className,
        )}
      />
    </CampoBase>
  )
}
