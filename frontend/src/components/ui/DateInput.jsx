import CampoBase from './CampoBase'
import { idsDeDescripcion } from '../../utils/descripcion'
import { unirClases } from '../../utils/clases'

// Fecha con calendario nativo, etiqueta, ayuda y error en una línea. Se usa en los formularios de
// préstamo (fecha de devolución comprometida) y en los filtros por rango. La fecha se interpreta
// como fecha civil (sin zona horaria) y se muestra en formato es-PE.
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
  const descrito = idsDeDescripcion(idCampo, ayuda, error).join(' ') || undefined

  return (
    <CampoBase id={idCampo} etiqueta={label} requerido={requerido} ayuda={ayuda} error={error}>
      <input
        {...propiedades}
        type="date"
        id={idCampo}
        name={name}
        required={requerido}
        aria-invalid={error ? 'true' : 'false'}
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
