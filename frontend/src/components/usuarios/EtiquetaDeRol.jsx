import { etiquetaDeRol } from '../../reglas/catalogos'

const ESTILOS = {
  Administrador: 'bg-marca-50 text-marca-800 border-marca-300/50',
  ResponsableDeTecnologia: 'bg-aviso-fondo text-aviso border-aviso/30',
  Colaborador: 'bg-superficie-tenue text-texto-suave border-borde',
}

// Rol del usuario con su nombre completo y un color propio, siempre acompañado de texto.
export default function EtiquetaDeRol({ rol }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        ESTILOS[rol] ?? ESTILOS.Colaborador
      }`}
    >
      {etiquetaDeRol(rol)}
    </span>
  )
}
