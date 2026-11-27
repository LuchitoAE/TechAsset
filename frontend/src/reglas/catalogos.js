// Catálogos del dominio que comparten los formularios y las etiquetas de la interfaz.
export const ROLES = [
  { valor: 'Administrador', etiqueta: 'Administrador' },
  { valor: 'ResponsableDeTecnologia', etiqueta: 'Responsable de Tecnología' },
  { valor: 'Colaborador', etiqueta: 'Colaborador' },
]

export const ESTADOS_DE_USUARIO = [
  { valor: 'true', etiqueta: 'Activos' },
  { valor: 'false', etiqueta: 'Deshabilitados' },
]

// D-08: las siete categorías del caso. El valor viaja como el nombre del enum de la API y la
// etiqueta es la que se muestra en la interfaz.
export const CATEGORIAS_EQUIPO = [
  { valor: 'Laptop', etiqueta: 'Laptop' },
  { valor: 'ComputadoraDeEscritorio', etiqueta: 'Computadora de escritorio' },
  { valor: 'Monitor', etiqueta: 'Monitor' },
  { valor: 'Impresora', etiqueta: 'Impresora' },
  { valor: 'Tablet', etiqueta: 'Tablet' },
  { valor: 'ProyectorMultimedia', etiqueta: 'Proyector multimedia' },
  { valor: 'EquipoDeRed', etiqueta: 'Equipo de red' },
]

export const ESTADOS_EQUIPO = [
  { valor: 'Disponible', etiqueta: 'Disponible' },
  { valor: 'Prestado', etiqueta: 'Prestado' },
  { valor: 'Mantenimiento', etiqueta: 'Mantenimiento' },
  { valor: 'Baja', etiqueta: 'Baja' },
]

// El estado Prestado lo asigna el sistema con el préstamo: no se elige a mano (RF-05, RF-08).
export const ESTADOS_INICIALES_EQUIPO = ESTADOS_EQUIPO.filter(
  (estado) => estado.valor !== 'Prestado',
)

// D-05: estados de un préstamo. Solicitado espera la decisión del Responsable; Activo ocupa el
// equipo; Devuelto y Rechazado son finales.
export const ESTADOS_PRESTAMO = [
  { valor: 'Solicitado', etiqueta: 'Solicitado' },
  { valor: 'Activo', etiqueta: 'Activo' },
  { valor: 'Devuelto', etiqueta: 'Devuelto' },
  { valor: 'Rechazado', etiqueta: 'Rechazado' },
]

export function etiquetaDeRol(rol) {
  return ROLES.find((opcion) => opcion.valor === rol)?.etiqueta ?? rol ?? ''
}

export function etiquetaDeCategoria(categoria) {
  return CATEGORIAS_EQUIPO.find((opcion) => opcion.valor === categoria)?.etiqueta ?? categoria ?? ''
}

export function etiquetaDeEstadoEquipo(estado) {
  return ESTADOS_EQUIPO.find((opcion) => opcion.valor === estado)?.etiqueta ?? estado ?? ''
}

export function etiquetaDeEstadoPrestamo(estado) {
  return ESTADOS_PRESTAMO.find((opcion) => opcion.valor === estado)?.etiqueta ?? estado ?? ''
}
