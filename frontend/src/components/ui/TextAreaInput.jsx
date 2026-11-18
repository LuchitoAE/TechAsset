import CampoBase from './CampoBase'
import { unirClases } from '../../utils/clases'

// Texto largo con etiqueta, ayuda y error. Se usa en las observaciones de la devolución (RN-10) y en
// el motivo del rechazo.
export default function TextAreaInput({
  id,
  name,
  label,
  error,
  ayuda,
  requerido = false,
  filas = 4,
  className,
  ...propiedades
}) {
  const idCampo = id ?? name
  const descrito = error ? `${idCampo}-error` : ayuda ? `${idCampo}-ayuda` : undefined

  return (
    <CampoBase id={idCampo} etiqueta={label} requerido={requerido} ayuda={ayuda} error={error}>
      <textarea
        {...propiedades}
        id={idCampo}
        name={name}
        rows={filas}
        required={requerido}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={descrito}
        className={unirClases(
          'w-full rounded-lg border bg-superficie px-3 py-2.5 text-sm text-texto shadow-campo transition-colors',
          'placeholder:text-texto-suave/60 focus:border-marca-600 focus:ring-2 focus:ring-marca-600/25',
          'disabled:cursor-not-allowed disabled:bg-superficie-tenue disabled:text-texto-suave',
          error ? 'border-error' : 'border-borde-fuerte',
          className,
        )}
      />
    </CampoBase>
  )
}
