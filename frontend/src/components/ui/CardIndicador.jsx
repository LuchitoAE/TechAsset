// Tarjeta de un indicador del panel: etiqueta, valor grande y un detalle que lo explica.
export default function CardIndicador({ etiqueta, valor, detalle, valorClassName, children }) {
  return (
    <article className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta">
      <h3 className="text-xs font-semibold tracking-wide text-texto-suave uppercase">{etiqueta}</h3>
      <p className={`mt-2 leading-tight font-bold text-titulo ${valorClassName ?? 'text-3xl'}`}>
        {valor}
      </p>
      {detalle && <p className="mt-2 text-sm leading-relaxed text-texto-suave">{detalle}</p>}
      {children}
    </article>
  )
}
