import { clienteApi } from './clienteApi'

// Operaciones de RF-09 a RF-12 sobre /api/prestamos.
function parametros(filtros = {}) {
  const busqueda = new URLSearchParams()

  if (filtros.texto) busqueda.set('texto', filtros.texto)
  if (filtros.estado) busqueda.set('estado', filtros.estado)
  if (filtros.id_equipo) busqueda.set('id_equipo', filtros.id_equipo)
  if (filtros.area) busqueda.set('area', filtros.area)
  if (filtros.desde) busqueda.set('desde', filtros.desde)
  if (filtros.hasta) busqueda.set('hasta', filtros.hasta)
  busqueda.set('pagina', String(filtros.pagina ?? 1))
  busqueda.set('tamano', String(filtros.tamano ?? 20))

  return busqueda.toString()
}

export function listarPrestamos(filtros = {}, senal) {
  return clienteApi.obtener(`/prestamos?${parametros(filtros)}`, senal)
}

export function listarPrestamosActivos(filtros = {}, senal) {
  return clienteApi.obtener(`/prestamos/activos?${parametros(filtros)}`, senal)
}

export function obtenerPrestamo(idPrestamo, senal) {
  return clienteApi.obtener(`/prestamos/${idPrestamo}`, senal)
}

export function solicitarPrestamo(datos, senal) {
  return clienteApi.enviar('/prestamos', datos, senal)
}

export function decidirAprobacion(idPrestamo, { aprobado, motivoRechazo }, senal) {
  return clienteApi.cambiar(
    `/prestamos/${idPrestamo}/aprobacion`,
    {
      aprobado_prestamo: aprobado,
      motivo_rechazo_prestamo: motivoRechazo,
    },
    senal,
  )
}

export function registrarDevolucion(idPrestamo, observacion, senal) {
  return clienteApi.cambiar(
    `/prestamos/${idPrestamo}/devolucion`,
    { observacion_prestamo: observacion },
    senal,
  )
}
