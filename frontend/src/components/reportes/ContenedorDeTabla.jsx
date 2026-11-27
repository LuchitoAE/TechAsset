import { useEffect, useRef, useState } from 'react'
import { anuncioDeOrden } from '../../reglas/reportes'

// Tabla accesible de un reporte. El contenedor se puede desplazar solo en horizontal (el resto de
// la página no se mueve) y es enfocable para que el teclado pueda recorrerlo (guía responsive-table).
// El encabezado queda fijo mientras se desplaza verticalmente y, si se pasan `orden` y `onOrdenar`,
// cada columna ordenable lleva un botón dentro del <th> y aria-sort en la columna activa.
function normalizarColumna(columna) {
  return typeof columna === 'string' ? { etiqueta: columna } : columna
}

export default function ContenedorDeTabla({
  id,
  titulo,
  columnas,
  children,
  nota,
  orden,
  onOrdenar,
}) {
  const columnasNormalizadas = columnas.map(normalizarColumna)
  const [anuncio, setAnuncio] = useState('')
  const primerRender = useRef(true)

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    if (orden) setAnuncio(anuncioDeOrden(orden, columnasNormalizadas))
    // columnasNormalizadas se recrea en cada render; el anuncio solo depende de la orden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden])

  return (
    <div className="contenedor-tabla-reporte overflow-hidden rounded-2xl border border-borde bg-superficie shadow-tarjeta">
      <div
        role="region"
        aria-labelledby={id}
        tabIndex={0}
        className="max-h-[70vh] max-w-full overflow-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      >
        <table className="tabla-reporte w-full border-collapse text-left text-sm sm:min-w-[36rem]">
          <caption id={id} className="sr-only">
            {titulo}
          </caption>
          <thead className="sticky top-0 z-10 bg-superficie-tenue text-xs tracking-wide text-texto-suave uppercase">
            <tr>
              {columnasNormalizadas.map((columna) => {
                const activa = orden?.clave && orden.clave === columna.clave
                const ordenable = Boolean(columna.clave && onOrdenar)

                return (
                  <th
                    key={columna.etiqueta}
                    scope="col"
                    aria-sort={
                      activa
                        ? orden.direccion === 'descendente'
                          ? 'descending'
                          : 'ascending'
                        : undefined
                    }
                    className={`px-4 py-3 font-semibold whitespace-nowrap ${
                      columna.etiqueta === 'Acciones' ? 'text-right' : ''
                    } ${columna.clase ?? ''}`}
                  >
                    {ordenable ? (
                      <button
                        type="button"
                        onClick={() => onOrdenar(columna)}
                        className="inline-flex min-h-6 items-center gap-1 rounded font-semibold uppercase hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {columna.etiqueta}
                        <span aria-hidden="true" className="text-[10px]">
                          {activa ? (orden.direccion === 'descendente' ? '▼' : '▲') : '↕'}
                        </span>
                      </button>
                    ) : (
                      columna.etiqueta
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde sm:divide-y">{children}</tbody>
        </table>
      </div>
      {nota && <p className="border-t border-borde px-4 py-3 text-xs text-texto-suave">{nota}</p>}
      {orden && onOrdenar && (
        <p className="sr-only" role="status" aria-live="polite">
          {anuncio}
        </p>
      )}
    </div>
  )
}
