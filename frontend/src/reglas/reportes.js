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

// RF-13: las cuatro barras de la distribución. Van en el orden de los estados del equipo y cada
// una lleva su color y su nombre, para no comunicar el estado solo con color (RNF-05).
export const DISTRIBUCION_DEL_INVENTARIO = [
  { clave: 'equipos_disponibles', etiqueta: 'Disponibles', clase: 'bg-exito' },
  { clave: 'equipos_prestados', etiqueta: 'Prestados', clase: 'bg-marca-600' },
  { clave: 'equipos_mantenimiento', etiqueta: 'En mantenimiento', clase: 'bg-aviso' },
  { clave: 'equipos_baja', etiqueta: 'Baja', clase: 'bg-error' },
]

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

export function distribucionDelInventario(indicadores) {
  const total = Math.max(0, Number(indicadores?.total_equipos ?? 0))
  const disponibles = Math.max(0, Number(indicadores?.equipos_disponibles ?? 0))
  const prestados = Math.max(0, Number(indicadores?.equipos_prestados ?? 0))
  const mantenimiento = Math.max(0, Number(indicadores?.equipos_mantenimiento ?? 0))

  // La API no expone un contador de Baja, pero el total sí la incluye. Se deriva para que las
  // cuatro barras sumen el total y ninguna quede fuera de la distribución (RF-13).
  const baja = Math.max(0, total - disponibles - prestados - mantenimiento)

  const valores = {
    equipos_disponibles: disponibles,
    equipos_prestados: prestados,
    equipos_mantenimiento: mantenimiento,
    equipos_baja: baja,
  }

  return DISTRIBUCION_DEL_INVENTARIO.map((fila) => {
    const valor = valores[fila.clave]
    return {
      ...fila,
      valor,
      porcentaje: total === 0 ? 0 : Math.round((valor / total) * 100),
    }
  })
}

// Ordenación de las tablas de reportes que ya tienen todos sus datos en memoria. Compara números
// como números y texto con Intl.Collator en español, con orden numérico para los códigos. No ordena
// arreglos que vienen paginados por la API: allí solo se ordena la página visible y sería engañoso.
const COLADOR = new Intl.Collator('es', { numeric: true, sensitivity: 'base' })

export function ordenarFilas(filas, { clave, direccion = 'ascendente', tipo = 'texto' } = {}) {
  if (!Array.isArray(filas) || !clave) return Array.isArray(filas) ? [...filas] : []

  const factor = direccion === 'descendente' ? -1 : 1

  return [...filas].sort((filaA, filaB) => {
    const valorA = filaA?.[clave]
    const valorB = filaB?.[clave]

    if (tipo === 'numero') {
      const numeroA = Number(valorA)
      const numeroB = Number(valorB)
      return factor * ((Number.isFinite(numeroA) ? numeroA : 0) - (Number.isFinite(numeroB) ? numeroB : 0))
    }

    return factor * COLADOR.compare(String(valorA ?? ''), String(valorB ?? ''))
  })
}

// Cambia la columna ordenada. La primera pulsación de una columna nueva ordena de forma ascendente;
// si ya estaba activa, invierte la dirección.
export function siguienteOrden(ordenActual, columna) {
  if (!columna?.clave) return ordenActual
  if (ordenActual?.clave === columna.clave) {
    return {
      ...ordenActual,
      direccion: ordenActual.direccion === 'ascendente' ? 'descendente' : 'ascendente',
    }
  }

  return { clave: columna.clave, direccion: 'ascendente', tipo: columna.tipo ?? 'texto' }
}

// Texto que se anuncia al ordenar, una sola vez, desde la región role="status" de la tabla.
export function anuncioDeOrden(orden, columnas = []) {
  if (!orden?.clave) return ''
  const columna = columnas.find((item) => item.clave === orden.clave)
  if (!columna) return ''
  const sentido = orden.direccion === 'descendente' ? 'descendente' : 'ascendente'
  return `Tabla ordenada por ${columna.etiqueta}, en orden ${sentido}.`
}

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
