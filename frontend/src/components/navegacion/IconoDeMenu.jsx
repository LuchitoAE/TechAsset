// Iconos de la barra lateral. Trazo de 1.6 px sobre una caja de 20, para que se lean a 20 px y no
// dependan de la fuente del sistema (los glifos de texto cambian de forma entre equipos).
const TRAZOS = {
  panel: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" />
    </>
  ),
  usuarios: (
    <>
      <circle cx="8" cy="7.5" r="3" />
      <path d="M2.5 17c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
      <path d="M14 5.2a2.6 2.6 0 0 1 0 5.1M15.5 12.9c1.4.5 2.4 1.7 2.4 3.6" />
    </>
  ),
  equipos: (
    <>
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" />
      <path d="M7 17h6M10 14v3" />
    </>
  ),
  prestamos: (
    <>
      <path d="M3 7h13l-3-3M17 13H4l3 3" />
    </>
  ),
  reportes: (
    <>
      <path d="M3 17V4M3 17h14" />
      <path d="M6.5 14V9M10 14V6.5M13.5 14v-3" />
    </>
  ),
  disponibilidad: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.5 10.2l2.4 2.4 4.6-4.8" />
    </>
  ),
}

export default function IconoDeMenu({ nombre, className = 'size-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {TRAZOS[nombre] ?? TRAZOS.panel}
    </svg>
  )
}
