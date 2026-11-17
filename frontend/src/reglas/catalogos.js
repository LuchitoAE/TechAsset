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

export function etiquetaDeRol(rol) {
  return ROLES.find((opcion) => opcion.valor === rol)?.etiqueta ?? rol ?? ''
}
