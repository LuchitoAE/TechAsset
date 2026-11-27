// Nombres legibles de los campos de los formularios. Se usan en el resumen de errores y en el aviso
// que se anuncia con aria-live cuando una persona sale de un campo con un valor inválido. Una sola
// fuente evita que el resumen y el mensaje junto al campo se llamen distinto.
export const ETIQUETAS_DE_CAMPO = {
  nombres_usuario: 'Nombres',
  apellidos_usuario: 'Apellidos',
  correo_usuario: 'Correo corporativo',
  area_usuario: 'Área',
  rol_usuario: 'Rol',
  contrasena: 'Contraseña',
  codigo_patrimonial_equipo: 'Código patrimonial',
  nombre_equipo: 'Nombre del equipo',
  categoria_equipo: 'Categoría',
  marca_equipo: 'Marca',
  estado_equipo: 'Estado',
  id_equipo: 'Equipo',
  fecha_devolucion: 'Fecha de devolución comprometida',
  observacion_prestamo: 'Observaciones de la devolución',
  motivo_rechazo_prestamo: 'Motivo del rechazo',
}

// Devuelve el nombre del campo; si no está en el catálogo, convierte el nombre técnico en una frase
// legible (por ejemplo, «fecha_devolucion» → «Fecha devolucion»).
export function etiquetaDeCampo(campo) {
  if (ETIQUETAS_DE_CAMPO[campo]) return ETIQUETAS_DE_CAMPO[campo]

  const texto = String(campo ?? '')
    .replace(/_/g, ' ')
    .trim()

  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : 'Campo'
}

// Texto del resumen de errores: cuántos campos hay que revisar y cuáles.
export function mensajeDeResumen(cantidad) {
  return cantidad === 1
    ? 'Revise 1 campo antes de continuar.'
    : `Revise ${cantidad} campos antes de continuar.`
}
