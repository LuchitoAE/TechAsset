import { useEffect } from 'react'
import { useEncabezadoDePagina } from '../../contextos/contextoDeEncabezado'
import { useTituloDePagina } from '../../utils/titulo'

// Encabezado de una pantalla: publica el título en la barra superior del shell y deja aquí la
// descripción y las acciones. El título de la página también actualiza el <title> del documento;
// `tituloDocumento` permite uno más corto cuando el h1 es un saludo o el nombre de un registro.
export default function EncabezadoDePagina({
  titulo,
  tituloDocumento,
  descripcion,
  acciones,
  children,
}) {
  useTituloDePagina(tituloDocumento ?? titulo)
  const contexto = useEncabezadoDePagina()
  const registrarTitulo = contexto?.registrarTitulo

  useEffect(() => {
    registrarTitulo?.(titulo)
  }, [registrarTitulo, titulo])

  if (!descripcion && !acciones && !children) return null

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {descripcion && (
          <p className="max-w-2xl text-sm leading-relaxed text-texto-suave">{descripcion}</p>
        )}
        {children}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-3">{acciones}</div>}
    </div>
  )
}
