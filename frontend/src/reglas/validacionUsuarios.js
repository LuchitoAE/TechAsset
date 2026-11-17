import { ROLES } from './catalogos'

// Validaciones del formulario de usuarios (RF-01, RF-02, RN-08, RN-11). Repiten las reglas del
// dominio solo para avisar antes de enviar; la API sigue siendo la que decide.
const LONGITUD_CORREO = 150
const PATRON_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/

function texto(valor) {
  return String(valor ?? '').trim()
}

function validarNombre(valor, etiqueta, errores, campo) {
  const contenido = texto(valor)

  if (!contenido) {
    errores[campo] = `${etiqueta} es obligatorio.`
  } else if (contenido.length < 2 || contenido.length > 100) {
    errores[campo] = `${etiqueta} debe tener entre 2 y 100 caracteres.`
  }
}

export function validarCorreo(valor) {
  const correo = texto(valor).toLowerCase()

  if (!correo) return 'El correo es obligatorio.'
  if (correo.length > LONGITUD_CORREO) return `El correo no puede superar los ${LONGITUD_CORREO} caracteres.`
  if (!PATRON_CORREO.test(correo)) return 'Escriba un correo válido, por ejemplo nombre@innovatech.pe.'

  return ''
}

export function validarContrasena(valor, { obligatoria = true } = {}) {
  const contrasena = String(valor ?? '')

  if (!contrasena) return obligatoria ? 'La contraseña es obligatoria.' : ''
  if (contrasena.length < 8 || contrasena.length > 64) return 'La contraseña debe tener entre 8 y 64 caracteres.'
  if (!/[A-Z]/.test(contrasena)) return 'La contraseña debe incluir al menos una mayúscula.'
  if (!/[a-z]/.test(contrasena)) return 'La contraseña debe incluir al menos una minúscula.'
  if (!/\d/.test(contrasena)) return 'La contraseña debe incluir al menos un número.'

  return ''
}

export function validarUsuario(datos, { esNuevo = true } = {}) {
  const errores = {}

  validarNombre(datos.nombres_usuario, 'Los nombres', errores, 'nombres_usuario')
  validarNombre(datos.apellidos_usuario, 'Los apellidos', errores, 'apellidos_usuario')
  validarNombre(datos.area_usuario, 'El área', errores, 'area_usuario')

  const errorCorreo = validarCorreo(datos.correo_usuario)
  if (errorCorreo) errores.correo_usuario = errorCorreo

  if (!ROLES.some((rol) => rol.valor === datos.rol_usuario)) {
    errores.rol_usuario = 'Seleccione un rol.'
  }

  const errorContrasena = validarContrasena(datos.contrasena, { obligatoria: esNuevo })
  if (errorContrasena) errores.contrasena = errorContrasena

  return errores
}

export function validarEdicionUsuario(datos) {
  return validarUsuario(datos, { esNuevo: false })
}

export function validarIngreso(credenciales) {
  const errores = {}

  const errorCorreo = validarCorreo(credenciales.correo_usuario)
  if (errorCorreo) errores.correo_usuario = errorCorreo

  if (!String(credenciales.contrasena ?? '')) {
    errores.contrasena = 'La contraseña es obligatoria.'
  }

  return errores
}

export function tieneErrores(errores) {
  return Object.keys(errores ?? {}).length > 0
}
