// IDs de los textos que describen a un campo: la ayuda y el error. Los controles los unen con
// aria-describedby para que el lector de pantalla lea la instrucción y, si existe, el error.
export function idsDeDescripcion(id, ayuda, error) {
  return [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean)
}
