// Navegación y permisos visibles. La API vuelve a comprobar el rol en cada operación (RNF-18).
export const MENUS_POR_ROL = {
  Administrador: [
    { ruta: '/usuarios', etiqueta: 'Usuarios' },
    { ruta: '/equipos', etiqueta: 'Equipos' },
    { ruta: '/reportes', etiqueta: 'Reportes' },
  ],
  ResponsableDeTecnologia: [
    { ruta: '/equipos', etiqueta: 'Equipos' },
    { ruta: '/prestamos', etiqueta: 'Préstamos' },
  ],
  Colaborador: [
    { ruta: '/equipos', etiqueta: 'Equipos' },
    { ruta: '/mis-prestamos', etiqueta: 'Mis préstamos' },
    { ruta: '/disponibilidad', etiqueta: 'Disponibilidad' },
  ],
}

export function menuDelRol(rol) {
  return MENUS_POR_ROL[rol] ?? []
}

export function puedeConsultarUsuarios(rol) {
  return rol === 'Administrador' || rol === 'ResponsableDeTecnologia'
}

export function puedeGestionarUsuarios(rol) {
  return rol === 'Administrador'
}

export function puedeDeshabilitarUsuarios(rol) {
  return rol === 'Administrador'
}

// RF-05, RF-06 y RF-08: el Administrador y el Responsable de Tecnología escriben; el Colaborador
// consulta el inventario en solo lectura.
export function puedeGestionarEquipos(rol) {
  return rol === 'Administrador' || rol === 'ResponsableDeTecnologia'
}

// Accesos rápidos del panel de inicio, según lo que cada rol puede hacer.
export const ACCESOS_POR_ROL = {
  Administrador: [
    { ruta: '/usuarios', titulo: 'Usuarios', detalle: 'Registrar, actualizar y deshabilitar cuentas.' },
    { ruta: '/equipos', titulo: 'Equipos', detalle: 'Inventario tecnológico, altas y estados.' },
    { ruta: '/reportes', titulo: 'Reportes', detalle: 'Indicadores y movimientos.' },
  ],
  ResponsableDeTecnologia: [
    { ruta: '/equipos', titulo: 'Equipos', detalle: 'Altas, cambios y disponibilidad.' },
    { ruta: '/prestamos', titulo: 'Préstamos', detalle: 'Solicitudes, aprobaciones y devoluciones.' },
  ],
  Colaborador: [
    { ruta: '/equipos', titulo: 'Inventario', detalle: 'Consulte equipos por estado y categoría.' },
    { ruta: '/mis-prestamos', titulo: 'Mis préstamos', detalle: 'Sus solicitudes y su historial.' },
    { ruta: '/disponibilidad', titulo: 'Disponibilidad', detalle: 'Equipos libres para solicitar.' },
  ],
}

export function accesosDelRol(rol) {
  return ACCESOS_POR_ROL[rol] ?? []
}
