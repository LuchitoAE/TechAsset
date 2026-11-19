// Envoltura de un campo: etiqueta visible, texto de ayuda y error junto al control. La ayuda y el
// error se muestran a la vez cuando hace falta: el error no reemplaza la instrucción que explica
// cómo corregirlo. Los controles enlazan los dos textos con aria-describedby.
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

      {ayuda && (
        <p id={idAyuda} className="text-xs leading-relaxed text-texto-suave">
          {ayuda}
        </p>
      )}

      {error && (
        <p
          id={idError}
          className="flex items-start gap-1.5 text-xs leading-relaxed font-medium text-error"
        >
          <span aria-hidden="true" className="mt-px shrink-0">
            ⚠
          </span>
          <span>
            <span className="sr-only">Error: </span>
            {' '}
            {error}
          </span>
        </p>
      )}
    </div>
  )
}
