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

const ICONOS = {
  sistema: '◐',
  claro: '☾',
  oscuro: '☀',
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
      className="grid size-11 place-items-center rounded-lg border border-borde bg-superficie text-base text-texto-suave transition-colors hover:bg-superficie-tenue"
    >
      <span aria-hidden="true">{ICONOS[modo]}</span>
    </button>
  )
}
