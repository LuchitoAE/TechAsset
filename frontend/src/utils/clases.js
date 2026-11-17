// Une clases condicionales sin dejar espacios ni valores falsos.
export function unirClases(...clases) {
  return clases.filter(Boolean).join(' ')
}
