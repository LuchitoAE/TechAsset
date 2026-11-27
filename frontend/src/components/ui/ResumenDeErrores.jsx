import { mensajeDeResumen } from '../../reglas/campos'

// Resumen de errores de un formulario. Se muestra solo después de intentar enviar, lleva el foco al
// campo que corresponde al pulsar cada enlace y usa role="alert" para que se anuncie una sola vez.
// Los mensajes de cada campo siguen junto al control: el resumen es un atajo, no los reemplaza.
export default function ResumenDeErrores({ errores = [], id = 'resumen-errores' }) {
  if (errores.length === 0) return null

  function irAlCampo(evento, campo) {
    evento.preventDefault()
    const elemento = document.getElementById(campo) ?? document.querySelector(`[name="${campo}"]`)
    elemento?.focus()
  }

  return (
    <div
      id={id}
      role="alert"
      tabIndex={-1}
      className="rounded-xl border border-error/40 bg-error-fondo px-4 py-3 text-sm text-error"
    >
      <p className="font-semibold">{mensajeDeResumen(errores.length)}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errores.map((error) => (
          <li key={error.campo}>
            <a
              href={`#${error.campo}`}
              onClick={(evento) => irAlCampo(evento, error.campo)}
              className="font-medium underline underline-offset-2 hover:no-underline"
            >
              {error.etiqueta}: {error.mensaje}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
