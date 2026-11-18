// Tabla accesible de un reporte. El contenedor se puede desplazar solo en horizontal (el resto de
// la página no se mueve) y es enfocable para que el teclado pueda recorrerlo (guía responsive-table).
// El encabezado queda fijo mientras se desplaza verticalmente.
export default function ContenedorDeTabla({ id, titulo, columnas, children, nota }) {
  return (
    <div className="contenedor-tabla-reporte overflow-hidden rounded-2xl border border-borde bg-superficie shadow-tarjeta">
      <div
        role="region"
        aria-labelledby={id}
        tabIndex={0}
        className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      >
        <table className="tabla-reporte w-full border-collapse text-left text-sm sm:min-w-[36rem]">
          <caption id={id} className="sr-only">
            {titulo}
          </caption>
          <thead className="sticky top-0 z-10 bg-superficie-tenue text-xs tracking-wide text-texto-suave uppercase">
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna}
                  scope="col"
                  className={`px-4 py-3 font-semibold whitespace-nowrap ${columna === 'Acciones' ? 'text-right' : ''}`}
                >
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde sm:divide-y">{children}</tbody>
        </table>
      </div>
      {nota && <p className="border-t border-borde px-4 py-3 text-xs text-texto-suave">{nota}</p>}
    </div>
  )
}
