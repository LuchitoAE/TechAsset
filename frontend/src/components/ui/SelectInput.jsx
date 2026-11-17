import CampoBase from './CampoBase'
import { unirClases } from '../../utils/clases'

// Lista de opciones con etiqueta y error. Se usa en rol, estado y filtros.
export default function SelectInput({
  id,
  name,
  label,
  opciones = [],
  placeholder,
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
      <select
        {...propiedades}
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
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </CampoBase>
  )
}
