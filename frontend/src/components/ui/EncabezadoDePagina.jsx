import { useTituloDePagina } from '../../utils/titulo'

// Encabezado de una pantalla: título, descripción y acciones alineadas a la derecha. El título de la
// página también actualiza el <title> del documento; `tituloDocumento` permite uno más corto cuando
// el h1 es un saludo o el nombre de un registro.
export default function EncabezadoDePagina({
  titulo,
  tituloDocumento,
  descripcion,
  acciones,
  children,
}) {
  useTituloDePagina(tituloDocumento ?? titulo)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-titulo sm:text-3xl">{titulo}</h1>
        {descripcion && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-texto-suave">{descripcion}</p>
        )}
        {children}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-3">{acciones}</div>}
    </div>
  )
}
