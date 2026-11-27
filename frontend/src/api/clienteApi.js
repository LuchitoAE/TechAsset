// Cliente único de la API. Traduce las respuestas { success, message, data } y los errores
// ProblemDetails { success:false, message, errors } a un error tipado que las pantallas entienden.

const BASE = '/api'

const MENSAJES_POR_ESTADO = {
  400: 'Revise los datos marcados.',
  401: 'Debe iniciar sesión.',
  403: 'Su rol no permite esta operación.',
  404: 'No se encontró lo que busca.',
  409: 'La operación entra en conflicto con otra información.',
  500: 'No se pudo completar la operación. Intente nuevamente.',
}

export class ErrorDeApi extends Error {
  constructor(mensaje, { estado = 0, errores = {}, tipo = 'ErrorDeApi' } = {}) {
    super(mensaje)
    this.name = 'ErrorDeApi'
    this.estado = estado
    this.errores = errores
    this.tipo = tipo
  }

  get esNoAutorizado() {
    return this.estado === 401
  }

  get esProhibido() {
    return this.estado === 403
  }

  get esConflicto() {
    return this.estado === 409
  }

  mensajeDeCampo(campo) {
    const detalle = this.errores?.[campo]
    if (Array.isArray(detalle)) return detalle[0] ?? ''
    return typeof detalle === 'string' ? detalle : ''
  }
}

// Normaliza errors: la API puede devolver arrays por campo y aquí se conserva el primero.
function normalizarErrores(errores) {
  if (!errores || typeof errores !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errores).map(([campo, mensajes]) => [
      campo,
      Array.isArray(mensajes) ? mensajes : [String(mensajes)],
    ]),
  )
}

async function solicitar(ruta, { metodo = 'GET', cuerpo, senal } = {}) {
  let respuesta

  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      credentials: 'include',
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: senal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ErrorDeApi('No se pudo conectar con el servidor. Revise su conexión e intente otra vez.', {
      tipo: 'SinConexion',
    })
  }

  const tipoDeContenido = respuesta.headers.get('content-type') || ''
  let datos = null

  if (tipoDeContenido.includes('json')) {
    try {
      datos = await respuesta.json()
    } catch {
      datos = null
    }
  }

  if (!respuesta.ok) {
    throw new ErrorDeApi(datos?.message || MENSAJES_POR_ESTADO[respuesta.status] || 'Ocurrió un error.', {
      estado: respuesta.status,
      errores: normalizarErrores(datos?.errors),
    })
  }

  return datos?.data ?? datos
}

export const clienteApi = {
  obtener: (ruta, senal) => solicitar(ruta, { senal }),
  enviar: (ruta, cuerpo, senal) => solicitar(ruta, { metodo: 'POST', cuerpo, senal }),
  actualizar: (ruta, cuerpo, senal) => solicitar(ruta, { metodo: 'PUT', cuerpo, senal }),
  cambiar: (ruta, cuerpo, senal) => solicitar(ruta, { metodo: 'PATCH', cuerpo, senal }),
}

// Convierte los errores por campo de la API en el objeto que usa el formulario.
export function erroresDeCampo(error) {
  if (!(error instanceof ErrorDeApi)) return {}
  return Object.fromEntries(
    Object.entries(error.errores).map(([campo, mensajes]) => [campo, mensajes[0] ?? '']),
  )
}
