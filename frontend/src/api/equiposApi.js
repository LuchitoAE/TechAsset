import { clienteApi } from './clienteApi'

// Operaciones de RF-05 a RF-08 sobre /api/equipos.
export function listarEquipos(filtros = {}, senal) {
  const parametros = new URLSearchParams()

  if (filtros.texto) parametros.set('texto', filtros.texto)
  if (filtros.estado) parametros.set('estado', filtros.estado)
  if (filtros.categoria) parametros.set('categoria', filtros.categoria)
  if (filtros.marca) parametros.set('marca', filtros.marca)
  parametros.set('pagina', String(filtros.pagina ?? 1))
  parametros.set('tamano', String(filtros.tamano ?? 20))

  return clienteApi.obtener(`/equipos?${parametros.toString()}`, senal)
}

export function obtenerEquipo(idEquipo, senal) {
  return clienteApi.obtener(`/equipos/${idEquipo}`, senal)
}

export function registrarEquipo(datos, senal) {
  return clienteApi.enviar('/equipos', datos, senal)
}

export function actualizarEquipo(idEquipo, datos, senal) {
  return clienteApi.actualizar(`/equipos/${idEquipo}`, datos, senal)
}

export function cambiarEstadoEquipo(idEquipo, estadoEquipo, senal) {
  return clienteApi.cambiar(`/equipos/${idEquipo}/estado`, { estado_equipo: estadoEquipo }, senal)
}
