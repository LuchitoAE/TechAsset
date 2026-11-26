// Tarjeta de un indicador del panel: glifo, valor grande, una nota corta y el nombre del indicador.
// El detalle opcional queda para pantallas que necesitan explicar el dato.
export default function CardIndicador({
  etiqueta,
  valor,
  detalle,
  nota,
  notaClassName,
  icono,
  valorClassName,
  children,
}) {
  return (
    <article className="rounded-[14px] border border-borde bg-superficie p-5">
      {icono && (
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-[10px] bg-marca-50 text-titulo"
        >
          {icono}
        </span>
      )}

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <p className={`leading-none font-bold text-titulo ${valorClassName ?? 'text-3xl'}`}>{valor}</p>
        {nota && (
          <p className={`text-xs font-semibold ${notaClassName ?? 'text-exito'}`}>{nota}</p>
        )}
      </div>

      <h3 className="mt-2 text-[13px] font-semibold text-texto-suave">{etiqueta}</h3>
      {detalle && <p className="mt-2 text-sm leading-relaxed text-texto-suave">{detalle}</p>}
      {children}
    </article>
  )
}
