import { forwardRef } from 'react'
import CampoBase from './CampoBase'
import { unirClases } from '../../utils/clases'

// Campo de texto con etiqueta, ayuda y error en una línea. Conserva el foco visible y 44 px de alto.
const TextInput = forwardRef(function TextInput(
  { id, name, label, error, ayuda, requerido = false, className, sufijo, ...propiedades },
  referencia,
) {
  const idCampo = id ?? name
  const descrito = error ? `${idCampo}-error` : ayuda ? `${idCampo}-ayuda` : undefined

  return (
    <CampoBase id={idCampo} etiqueta={label} requerido={requerido} ayuda={ayuda} error={error}>
      <div className="relative">
        <input
          {...propiedades}
          ref={referencia}
          id={idCampo}
          name={name}
          required={requerido}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={descrito}
          className={unirClases(
            'h-11 w-full rounded-lg border bg-superficie px-3 text-sm text-texto shadow-campo transition-colors',
            'placeholder:text-texto-suave/60 focus:border-marca-600 focus:ring-2 focus:ring-marca-600/25',
            'disabled:cursor-not-allowed disabled:bg-superficie-tenue disabled:text-texto-suave',
            error ? 'border-error' : 'border-borde-fuerte',
            sufijo ? 'pr-24' : '',
            className,
          )}
        />
        {sufijo && <span className="absolute inset-y-0 right-1.5 flex items-center">{sufijo}</span>}
      </div>
    </CampoBase>
  )
})

export default TextInput
