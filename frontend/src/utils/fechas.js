// Formato de fechas de negocio (AAAA-MM-DD) para la interfaz, sin depender de la zona horaria del
// navegador: se arma con las partes de la fecha.
export function formatearFecha(fecha) {
  if (!fecha) return '—'

  const [anio, mes, dia] = String(fecha).split('-')
  if (!anio || !mes || !dia) return String(fecha)

  return `${dia}/${mes}/${anio}`
}

// Suma días a una fecha AAAA-MM-DD. Se usa para la fecha mínima del formulario de préstamo.
export function sumarDias(fecha, dias) {
  const [anio, mes, dia] = String(fecha).split('-').map(Number)
  const resultado = new Date(Date.UTC(anio, mes - 1, dia + dias))
  return resultado.toISOString().slice(0, 10)
}
