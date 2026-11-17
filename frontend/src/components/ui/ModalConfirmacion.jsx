import { useEffect, useRef } from 'react'
import Button from './Button'

// Confirmación de una acción que no se deshace. Se cierra con Esc o con Cancelar y enfoca el botón
// de confirmar al abrir.
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
  const botonConfirmar = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined

    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') onCancelar?.()
    }

    document.addEventListener('keydown', alPresionarTecla)
    botonConfirmar.current?.focus()

    return () => document.removeEventListener('keydown', alPresionarTecla)
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacion"
        aria-describedby="mensaje-confirmacion"
        className="w-full max-w-md rounded-2xl border border-borde bg-superficie p-6 shadow-tarjeta"
      >
        <h2 id="titulo-confirmacion" className="text-lg font-bold text-titulo">
          {titulo}
        </h2>
        <p id="mensaje-confirmacion" className="mt-2 text-sm leading-relaxed text-texto-suave">
          {mensaje}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variante="secundario" onClick={onCancelar} disabled={cargando}>
            {textoCancelar}
          </Button>
          <Button
            ref={botonConfirmar}
            variante={peligro ? 'peligro' : 'primario'}
            cargando={cargando}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </Button>
        </div>
      </section>
    </div>
  )
}
