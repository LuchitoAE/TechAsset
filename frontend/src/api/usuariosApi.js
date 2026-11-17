import { clienteApi } from './clienteApi'

// Operaciones de RF-01 a RF-04 sobre /api/usuarios.
export function listarUsuarios(filtros = {}, senal) {
  const parametros = new URLSearchParams()

  if (filtros.texto) parametros.set('texto', filtros.texto)
  if (filtros.rol) parametros.set('rol', filtros.rol)
  if (filtros.activo !== '' && filtros.activo !== undefined && filtros.activo !== null) {
    parametros.set('activo', String(filtros.activo))
  }
  if (filtros.area) parametros.set('area', filtros.area)
  parametros.set('pagina', String(filtros.pagina ?? 1))
  parametros.set('tamano', String(filtros.tamano ?? 20))

  return clienteApi.obtener(`/usuarios?${parametros.toString()}`, senal)
}

export function obtenerUsuario(idUsuario, senal) {
  return clienteApi.obtener(`/usuarios/${idUsuario}`, senal)
}

export function registrarUsuario(datos, senal) {
  return clienteApi.enviar('/usuarios', datos, senal)
}

export function actualizarUsuario(idUsuario, datos, senal) {
  return clienteApi.actualizar(`/usuarios/${idUsuario}`, datos, senal)
}

export function cambiarEstadoUsuario(idUsuario, activoUsuario, senal) {
  return clienteApi.cambiar(`/usuarios/${idUsuario}/estado`, { activo_usuario: activoUsuario }, senal)
}
