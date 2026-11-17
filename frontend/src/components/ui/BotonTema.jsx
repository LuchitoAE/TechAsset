import { useState } from 'react'

// Cambia entre modo claro y oscuro y lo guarda. El modo inicial lo decide index.html antes de dibujar
// para que no haya destello.
export default function BotonTema() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema || 'claro')

  function alternar() {
    const siguiente = tema === 'oscuro' ? 'claro' : 'oscuro'
    document.documentElement.dataset.tema = siguiente
    try {
      localStorage.setItem('techasset.tema', siguiente)
    } catch {
      // Si el navegador bloquea el almacenamiento, el cambio vale solo para esta visita.
    }
    setTema(siguiente)
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
      className="grid size-10 place-items-center rounded-lg border border-borde bg-superficie text-base text-texto-suave transition-colors hover:bg-superficie-tenue"
    >
      <span aria-hidden="true">{tema === 'oscuro' ? '☀' : '☾'}</span>
    </button>
  )
}
