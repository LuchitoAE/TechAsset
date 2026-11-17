// Pantalla de espera mientras se comprueba la sesión o se carga una consulta.
export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-texto-suave">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-marca-300 border-t-marca-700"
      />
      {texto}
    </div>
  )
}
