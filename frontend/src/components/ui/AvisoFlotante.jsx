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
// que los lectores de pantalla anuncien el texto cuando aparece. Admite varios avisos en cola: se
// apilan, cada uno tiene su botón de cerrar con nombre y el puntero o el foco pausan su cierre.
export default function AvisoFlotante({ avisos = [], onCerrar, onPausar, onReanudar }) {
  function alSalirDelAviso(evento, id) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) onReanudar?.(id)
  }

  // Si se cierra con el teclado un aviso que tenía el foco, el foco pasa al siguiente aviso para no
  // dejar a la persona sin punto de referencia (guía persistent-toast-notifications).
  function cerrarAviso(evento, id) {
    const teniaElFoco = document.activeElement === evento.currentTarget
    const botones = [...evento.currentTarget.closest('#notificaciones').querySelectorAll('button')]
    const indice = botones.indexOf(evento.currentTarget)

    onCerrar?.(id)

    if (!teniaElFoco) return

    requestAnimationFrame(() => {
      const restantes = [...document.querySelectorAll('#notificaciones button')]
      const siguiente = restantes[Math.min(indice, restantes.length - 1)]
      if (siguiente) siguiente.focus()
      else document.getElementById('contenido-principal')?.focus({ preventScroll: true })
    })
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div
        id="notificaciones"
        role="status"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Notificaciones"
        className="flex w-full max-w-sm flex-col gap-2"
      >
        {avisos.map((aviso) => {
          const configuracion = ESTILOS[aviso.tipo] ?? ESTILOS.exito

          return (
            <div
              key={aviso.id}
              className={`pointer-events-auto flex animate-[aparecer-aviso_160ms_ease-out] items-start gap-3 rounded-xl border px-4 py-3 shadow-tarjeta ${configuracion.clases}`}
              onMouseEnter={() => onPausar?.(aviso.id)}
              onMouseLeave={() => onReanudar?.(aviso.id)}
              onFocus={() => onPausar?.(aviso.id)}
              onBlur={(evento) => alSalirDelAviso(evento, aviso.id)}
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
                onClick={(evento) => cerrarAviso(evento, aviso.id)}
                aria-label="Cerrar el aviso"
                className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-lg leading-none hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
