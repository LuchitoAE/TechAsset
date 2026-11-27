// Reglas del préstamo en el frontend: repiten las del dominio solo para avisar antes de enviar;
// la API sigue siendo la que decide (ESTANDARES.md, sección 3).
const LONGITUD_MINIMA_TEXTO = 5
const LONGITUD_MAXIMA_TEXTO = 500
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/

function texto(valor) {
  return String(valor ?? '').trim()
}

// «Hoy» en America/Lima como AAAA-MM-DD, para comparar fechas de negocio sin depender de la zona del
// navegador.
export function fechaDeHoyEnLima() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// RF-09, RN-04: un equipo, una fecha de devolución posterior a hoy y el responsable de la sesión.
export function validarSolicitudPrestamo(datos, { hoy = fechaDeHoyEnLima() } = {}) {
  const errores = {}

  if (!texto(datos.id_equipo)) {
    errores.id_equipo = 'Seleccione el equipo que desea solicitar.'
  }

  const fecha = texto(datos.fecha_devolucion)
  if (!fecha) {
    errores.fecha_devolucion = 'Indique la fecha de devolución comprometida.'
  } else if (!PATRON_FECHA.test(fecha)) {
    errores.fecha_devolucion = 'Use una fecha válida, por ejemplo 2026-11-24.'
  } else if (fecha <= hoy) {
    errores.fecha_devolucion = 'La fecha de devolución debe ser posterior a la fecha de préstamo.'
  }

  return errores
}

// RN-10: toda devolución registra observaciones de entre 5 y 500 caracteres.
export function validarDevolucion(datos) {
  return validarTextoObligatorio({
    campo: 'observacion_prestamo',
    valor: datos.observacion_prestamo,
    mensajeObligatorio: 'Registre las observaciones de la devolución.',
    nombreDelDato: 'Las observaciones de la devolución',
  })
}

// RF-09: el rechazo de una solicitud registra su motivo.
export function validarRechazo(datos) {
  return validarTextoObligatorio({
    campo: 'motivo_rechazo_prestamo',
    valor: datos.motivo_rechazo_prestamo,
    mensajeObligatorio: 'Registre el motivo del rechazo.',
    nombreDelDato: 'El motivo del rechazo',
  })
}

function validarTextoObligatorio({ campo, valor, mensajeObligatorio, nombreDelDato }) {
  const errores = {}
  const contenido = texto(valor)

  if (!contenido) {
    errores[campo] = mensajeObligatorio
  } else if (contenido.length < LONGITUD_MINIMA_TEXTO || contenido.length > LONGITUD_MAXIMA_TEXTO) {
    errores[campo] =
      `${nombreDelDato} debe tener entre ${LONGITUD_MINIMA_TEXTO} y ${LONGITUD_MAXIMA_TEXTO} caracteres.`
  }

  return errores
}

// RF-12: un préstamo vence cuando sigue activo y hoy ya pasó la fecha comprometida.
export function estaVencido(prestamo, hoy = fechaDeHoyEnLima()) {
  return Boolean(
    prestamo &&
      prestamo.estado_prestamo === 'Activo' &&
      prestamo.fecha_devolucion &&
      prestamo.fecha_devolucion < hoy,
  )
}

// D-04: solo una solicitud pendiente se aprueba o se rechaza.
export function puedeAprobarse(prestamo) {
  return prestamo?.estado_prestamo === 'Solicitado'
}

// RN-10: solo un préstamo activo se devuelve.
export function puedeDevolverse(prestamo) {
  return prestamo?.estado_prestamo === 'Activo'
}

export function tieneErrores(errores) {
  return Object.keys(errores ?? {}).length > 0
}
