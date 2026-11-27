import { CATEGORIAS_EQUIPO, ESTADOS_INICIALES_EQUIPO } from './catalogos'

// Validaciones del formulario de equipos (RF-05, RF-06, RN-07). Repiten las reglas del dominio
// solo para avisar antes de enviar; la API sigue siendo la que decide.
const LONGITUD_CODIGO = 50
const LONGITUD_NOMBRE_MINIMA = 3
const LONGITUD_NOMBRE_MAXIMA = 100
const LONGITUD_MARCA_MINIMA = 2
const LONGITUD_MARCA_MAXIMA = 50

function texto(valor) {
  return String(valor ?? '').trim()
}

export function normalizarCodigoPatrimonial(valor) {
  return texto(valor).toUpperCase()
}

export function validarEquipo(datos, { esNuevo = true } = {}) {
  const errores = {}

  const codigo = normalizarCodigoPatrimonial(datos.codigo_patrimonial_equipo)
  if (!codigo) {
    errores.codigo_patrimonial_equipo = 'El código patrimonial es obligatorio.'
  } else if (codigo.length > LONGITUD_CODIGO) {
    errores.codigo_patrimonial_equipo = `El código patrimonial no puede superar los ${LONGITUD_CODIGO} caracteres.`
  }

  const nombre = texto(datos.nombre_equipo)
  if (!nombre) {
    errores.nombre_equipo = 'El nombre del equipo es obligatorio.'
  } else if (nombre.length < LONGITUD_NOMBRE_MINIMA || nombre.length > LONGITUD_NOMBRE_MAXIMA) {
    errores.nombre_equipo = `El nombre del equipo debe tener entre ${LONGITUD_NOMBRE_MINIMA} y ${LONGITUD_NOMBRE_MAXIMA} caracteres.`
  }

  if (!CATEGORIAS_EQUIPO.some((categoria) => categoria.valor === datos.categoria_equipo)) {
    errores.categoria_equipo = 'Seleccione una categoría.'
  }

  const marca = texto(datos.marca_equipo)
  if (!marca) {
    errores.marca_equipo = 'La marca es obligatoria.'
  } else if (marca.length < LONGITUD_MARCA_MINIMA || marca.length > LONGITUD_MARCA_MAXIMA) {
    errores.marca_equipo = `La marca debe tener entre ${LONGITUD_MARCA_MINIMA} y ${LONGITUD_MARCA_MAXIMA} caracteres.`
  }

  // En la edición el estado no se toca: se cambia desde la sección de estado del detalle (RF-08).
  if (esNuevo && !ESTADOS_INICIALES_EQUIPO.some((estado) => estado.valor === datos.estado_equipo)) {
    errores.estado_equipo = 'Seleccione el estado inicial: Disponible, Mantenimiento o Baja.'
  }

  return errores
}

export function validarEdicionEquipo(datos) {
  return validarEquipo(datos, { esNuevo: false })
}

// El estado Prestado lo controla el préstamo; mientras el equipo esté prestado no se cambia a mano.
export function puedeCambiarEstado(equipo) {
  return Boolean(equipo) && equipo.estado_equipo !== 'Prestado'
}

export function estadosDisponiblesPara(equipo) {
  if (!puedeCambiarEstado(equipo)) return []

  return ESTADOS_INICIALES_EQUIPO.filter((estado) => estado.valor !== equipo.estado_equipo)
}

export function tieneErrores(errores) {
  return Object.keys(errores ?? {}).length > 0
}
