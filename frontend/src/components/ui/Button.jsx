import { unirClases } from '../../utils/clases'

const VARIANTES = {
  primario:
    'bg-marca-700 text-white hover:bg-marca-800 focus-visible:outline-foco disabled:bg-marca-300',
  secundario:
    'border border-borde-fuerte bg-superficie text-texto hover:bg-superficie-tenue disabled:text-texto-suave',
  peligro: 'bg-error text-white hover:opacity-90 focus-visible:outline-error disabled:opacity-60',
  fantasma: 'text-marca-700 hover:bg-marca-50 disabled:text-texto-suave',
}

// Acción principal, secundaria o de peligro. Mientras carga queda deshabilitada y dice qué hace.
export default function Button({
  children,
  variante = 'primario',
  cargando = false,
  textoCargando,
  tipo = 'button',
  className,
  disabled,
  ...propiedades
}) {
  return (
    <button
      {...propiedades}
      type={tipo}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={unirClases(
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        VARIANTES[variante] ?? VARIANTES.primario,
        className,
      )}
    >
      {cargando && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {cargando ? textoCargando ?? 'Procesando…' : children}
    </button>
  )
}
