import { Link } from 'react-router'

// Migas de pan de una pantalla interna. Marcan la jerarquía con una lista ordenada y aria-current en
// la página actual, para que la ubicación no dependa solo del menú principal.
export default function MigasDePan({ items = [] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((item, indice) => {
          const ultimo = indice === items.length - 1

          return (
            <li key={`${item.etiqueta}-${indice}`} className="flex min-w-0 items-center gap-1.5">
              {indice > 0 && (
                <span aria-hidden="true" className="text-texto-suave">
                  /
                </span>
              )}
              {ultimo || !item.ruta ? (
                <span
                  aria-current={ultimo ? 'page' : undefined}
                  className="max-w-[18rem] truncate font-semibold text-texto"
                >
                  {item.etiqueta}
                </span>
              ) : (
                <Link
                  to={item.ruta}
                  className="inline-flex min-h-6 items-center rounded text-marca-700 hover:underline"
                >
                  {item.etiqueta}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
