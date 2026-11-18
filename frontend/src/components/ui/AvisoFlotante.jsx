const ESTILOS = {
  exito: {
    clases: 'border-exito/30 bg-exito-fondo text-exito',
    icono: '✓',
  },
  error: {
    clases: 'border-error/30 bg-error-fondo text-error',
    icono: '!',
  },
}

// Aviso flotante global de RNF-04. La región role="status" existe siempre —aunque esté vacía— para
// que los lectores de pantalla anuncien el texto cuando aparece; el botón de cerrar tiene nombre.
export default function AvisoFlotante({ aviso, onCerrar }) {
  const configuracion = ESTILOS[aviso?.tipo] ?? ESTILOS.exito

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="w-full max-w-sm"
      >
        {aviso && (
          <div
            className={`pointer-events-auto flex animate-[aparecer-aviso_160ms_ease-out] items-start gap-3 rounded-xl border px-4 py-3 shadow-tarjeta ${configuracion.clases}`}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-current text-xs font-bold"
            >
              {configuracion.icono}
            </span>
            <p className="min-w-0 flex-1 text-sm leading-relaxed font-medium">{aviso.texto}</p>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar el aviso"
              className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-lg leading-none hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
