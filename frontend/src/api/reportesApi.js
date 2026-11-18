import { clienteApi } from './clienteApi'

// Consultas de salida de RF-13 a RF-17 sobre /api/reportes.
function parametros(filtros = {}) {
  const busqueda = new URLSearchParams()

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      busqueda.set(clave, String(valor))
    }
  })

  return busqueda.toString()
}

export function obtenerIndicadores(senal) {
  return clienteApi.obtener('/reportes/panel', senal)
}

export function listarEquiposPorEstado(filtros = {}, senal) {
  return clienteApi.obtener(`/reportes/equipos-por-estado?${parametros(filtros)}`, senal)
}

export function listarEquiposMasUtilizados(filtros = {}, senal) {
  return clienteApi.obtener(`/reportes/equipos-mas-utilizados?${parametros(filtros)}`, senal)
}

export function listarPrestamosPorArea(filtros = {}, senal) {
  return clienteApi.obtener(`/reportes/prestamos-por-area?${parametros(filtros)}`, senal)
}

export function listarMovimientos(filtros = {}, senal) {
  return clienteApi.obtener(`/reportes/movimientos?${parametros(filtros)}`, senal)
}
