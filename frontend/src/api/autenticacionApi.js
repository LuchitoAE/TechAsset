import { clienteApi } from './clienteApi'

// Operaciones de acceso (RN-11). La cookie de sesión la maneja el navegador; aquí no se guarda nada.
export function ingresar(credenciales, senal) {
  return clienteApi.enviar('/autenticacion/ingreso', credenciales, senal)
}

export function obtenerSesion(senal) {
  return clienteApi.obtener('/autenticacion/sesion', senal)
}

export function salir(senal) {
  return clienteApi.enviar('/autenticacion/salida', undefined, senal)
}
