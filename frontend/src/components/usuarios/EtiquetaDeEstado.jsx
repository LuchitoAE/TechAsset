// Estado del usuario con color, punto y texto: activo o deshabilitado (RNF-05).
export default function EtiquetaDeEstado({ activo }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        activo
          ? 'border-exito/30 bg-exito-fondo text-exito'
          : 'border-borde bg-superficie-tenue text-texto-suave'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${activo ? 'bg-exito' : 'bg-texto-suave'}`}
      />
      {activo ? 'Activo' : 'Deshabilitado'}
    </span>
  )
}
