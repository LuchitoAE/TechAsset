// Catálogo y formato de los reportes (RF-13 a RF-17). Las reglas viven en un solo lugar para que
// las tablas, los filtros y las pruebas hablen el mismo idioma.

export const TIPOS_DE_MOVIMIENTO = [
  { valor: 'EquipoRegistrado', etiqueta: 'Alta de equipo', icono: '+' },
  { valor: 'EquipoActualizado', etiqueta: 'Equipo actualizado', icono: '✎' },
  { valor: 'EquipoEstadoCambiado', etiqueta: 'Cambio de estado', icono: '↺' },
  { valor: 'PrestamoSolicitado', etiqueta: 'Préstamo solicitado', icono: '…' },
  { valor: 'PrestamoAprobado', etiqueta: 'Préstamo aprobado', icono: '✓' },
  { valor: 'PrestamoRechazado', etiqueta: 'Préstamo rechazado', icono: '×' },
  { valor: 'PrestamoDevuelto', etiqueta: 'Préstamo devuelto', icono: '↩' },
]

export const LIMITE_RANKING = 10
export const LIMITE_RANKING_COMPLETO = 100

export function etiquetaDeTipoMovimiento(tipo) {
  return TIPOS_DE_MOVIMIENTO.find((opcion) => opcion.valor === tipo)?.etiqueta ?? tipo ?? ''
}

export function iconoDeTipoMovimiento(tipo) {
  return TIPOS_DE_MOVIMIENTO.find((opcion) => opcion.valor === tipo)?.icono ?? '·'
}

// D-09: si hay empate, la API devuelve todas las áreas y aquí se muestran juntas.
export function resumenDeAreas(areas) {
  if (!Array.isArray(areas) || areas.length === 0) return 'Sin préstamos'
  return areas.join(', ')
}

// Porcentaje con coma decimal, como se escribe en español: 66,7 %.
export function formatearPorcentaje(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return '0 %'
  return `${numero.toFixed(1).replace('.', ',')} %`
}

// Ancho de la barra simple en CSS. Se acota entre 0 y 100 para que no desborde la celda.
export function anchoDeBarra(porcentaje) {
  const numero = Number(porcentaje)
  if (!Number.isFinite(numero)) return '0%'
  return `${Math.min(100, Math.max(0, numero))}%`
}

// Devuelve el error del rango de fechas para avisar antes de consultar. La API vuelve a validarlo.
export function validarRangoDeFechas(desde, hasta) {
  if (desde && hasta && desde > hasta) {
    return { desde: 'La fecha inicial no puede ser posterior a la fecha final.' }
  }
  return {}
}

// Fecha y hora de un movimiento (marca de tiempo UTC) en la zona de Lima, sin depender de la zona
// del navegador.
export function formatearFechaYHora(fecha) {
  if (!fecha) return '—'

  const instante = new Date(fecha)
  if (Number.isNaN(instante.getTime())) return String(fecha)

  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(instante)
}
