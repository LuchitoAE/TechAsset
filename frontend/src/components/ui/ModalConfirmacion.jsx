import { useEffect, useRef } from 'react'
import Button from './Button'

// Confirmación de una acción que no se deshace. Usa el elemento nativo <dialog> abierto con
// showModal(): el navegador deja inerte el resto de la página, atrapa el foco, cierra con Escape y
// devuelve el foco al botón que la abrió (guía dialog y accessibility, sección 12).
//
// En navegadores donde showModal no existe (por ejemplo, el DOM de las pruebas con jsdom) se usa el
// atributo open y un manejador de Escape, para que la misma pantalla siga siendo operable.
export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const dialogo = useRef(null)
  const botonSeguro = useRef(null)
  const invocador = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined

    const elemento = dialogo.current
    const elementoQueAbrio = document.activeElement
    invocador.current = elementoQueAbrio instanceof HTMLElement ? elementoQueAbrio : null

    if (elemento) {
      if (typeof elemento.showModal === 'function') {
        if (!elemento.open) elemento.showModal()
      } else {
        elemento.setAttribute('open', '')
      }
    }

    // La acción segura (Cancelar) recibe el foco en una confirmación destructiva; en las demás, el
    // botón principal. Así una pulsación de Enter no ejecuta la acción por accidente.
    const temporizador = setTimeout(() => botonSeguro.current?.focus(), 0)

    return () => {
      clearTimeout(temporizador)
      if (elemento?.open) {
        if (typeof elemento.close === 'function') elemento.close()
        else elemento.removeAttribute('open')
      }
      if (invocador.current?.isConnected) invocador.current.focus()
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return undefined

    function alPresionarTecla(evento) {
      if (evento.key !== 'Escape') return
      evento.preventDefault()
      onCancelar?.()
    }

    function alCancelarNativo(evento) {
      // Escape dispara cancel antes de cerrar: se delega en el estado de React para que la pantalla
      // que abrió el diálogo decida qué hacer.
      evento.preventDefault()
      onCancelar?.()
    }

    document.addEventListener('keydown', alPresionarTecla)
    const elemento = dialogo.current
    elemento?.addEventListener('cancel', alCancelarNativo)

    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      elemento?.removeEventListener('cancel', alCancelarNativo)
    }
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-confirmacion"
      aria-describedby="mensaje-confirmacion"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-borde bg-superficie p-6 text-texto shadow-tarjeta"
    >
      <h2 id="titulo-confirmacion" className="text-lg font-bold text-titulo">
        {titulo}
      </h2>
      <p id="mensaje-confirmacion" className="mt-2 text-sm leading-relaxed text-texto-suave">
        {mensaje}
      </p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          ref={botonSeguro}
          variante="secundario"
          onClick={onCancelar}
          disabled={cargando}
        >
          {textoCancelar}
        </Button>
        <Button
          variante={peligro ? 'peligro' : 'primario'}
          cargando={cargando}
          onClick={onConfirmar}
        >
          {textoConfirmar}
        </Button>
      </div>
    </dialog>
  )
}
