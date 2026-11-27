import { useCallback, useEffect, useState } from 'react'

const CLAVE_DEL_TEMA = 'techasset.tema'

function siguienteModo(modo) {
  const sistemaOscuro = sistemaPrefiereOscuro()

  if (modo === 'sistema') return sistemaOscuro ? 'claro' : 'oscuro'
  if (modo === 'oscuro') return sistemaOscuro ? 'sistema' : 'claro'
  return sistemaOscuro ? 'oscuro' : 'sistema'
}

// El modo guardado solo puede ser «claro» u «oscuro». Si no hay nada guardado, se sigue al sistema:
// así el valor por defecto no queda fijado contra un cambio futuro del sistema operativo.
function modoGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_DEL_TEMA)
    return guardado === 'claro' || guardado === 'oscuro' ? guardado : 'sistema'
  } catch {
    return 'sistema'
  }
}

function sistemaPrefiereOscuro() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function temaEfectivo(modo) {
  if (modo === 'sistema') return sistemaPrefiereOscuro() ? 'oscuro' : 'claro'
  return modo
}

const ETIQUETAS = {
  sistema: 'Tema del sistema',
  claro: 'Tema claro',
  oscuro: 'Tema oscuro',
}

const ACCIONES = {
  sistema: 'Volver al tema del sistema',
  claro: 'Cambiar al tema claro',
  oscuro: 'Cambiar al tema oscuro',
}

// Iconos de línea: se dibujan con SVG para que no dependan de la fuente del sistema operativo.
function Icono({ modo }) {
  const comun = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
  }

  if (modo === 'claro') {
    return (
      <svg {...comun}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }

  if (modo === 'oscuro') {
    return (
      <svg {...comun}>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    )
  }

  return (
    <svg {...comun}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Alterna entre tema del sistema, claro y oscuro, y lo guarda. El modo inicial lo decide index.html
// antes de dibujar para que no haya destello; aquí se mantiene sincronizado con el sistema cuando la
// persona eligió «sistema» (guías dark-mode y dark-mode-toggle).
export default function BotonTema() {
  const [modo, setModo] = useState(modoGuardado)
  const siguiente = siguienteModo(modo)

  const aplicar = useCallback((siguiente) => {
    document.documentElement.dataset.tema = temaEfectivo(siguiente)
  }, [])

  useEffect(() => {
    aplicar(modo)

    if (modo !== 'sistema' || typeof window.matchMedia !== 'function') return undefined

    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    const alCambiarElSistema = () => aplicar('sistema')
    consulta.addEventListener?.('change', alCambiarElSistema)

    return () => consulta.removeEventListener?.('change', alCambiarElSistema)
  }, [aplicar, modo])

  function alternar() {
    const destino = siguienteModo(modo)
    setModo(destino)
    aplicar(destino)

    try {
      if (destino === 'sistema') localStorage.removeItem(CLAVE_DEL_TEMA)
      else localStorage.setItem(CLAVE_DEL_TEMA, destino)
    } catch {
      // Si el navegador bloquea el almacenamiento, el cambio vale solo para esta visita.
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={`${ETIQUETAS[modo]}. ${ACCIONES[siguiente]}`}
      title={ACCIONES[siguiente]}
      className="grid size-11 place-items-center rounded-lg border border-borde bg-superficie text-texto-suave transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
    >
      <span aria-hidden="true">
        <Icono modo={modo} />
      </span>
    </button>
  )
}
