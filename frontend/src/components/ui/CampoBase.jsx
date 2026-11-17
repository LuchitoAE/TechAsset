// Envoltura de un campo: etiqueta visible, texto de ayuda y error junto al control.
export default function CampoBase({ id, etiqueta, requerido = false, ayuda, error, children }) {
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`

  return (
    <div className="space-y-1.5">
      {etiqueta && (
        <label htmlFor={id} className="block text-sm font-semibold text-texto">
          {etiqueta}
          {requerido && (
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p id={idError} role="alert" className="text-xs leading-relaxed font-medium text-error">
          {error}
        </p>
      ) : ayuda ? (
        <p id={idAyuda} className="text-xs leading-relaxed text-texto-suave">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
