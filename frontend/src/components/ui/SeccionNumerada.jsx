// Tarjeta numerada de un formulario: el número, el título y la explicación de lo que se pide. Las
// tres pantallas de alta y edición comparten esta estructura para que el orden se lea igual.
export default function SeccionNumerada({ id, numero, titulo, descripcion, children }) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-marca-50 text-sm font-bold text-marca-700"
        >
          {numero}
        </span>
        <div>
          <h2 id={id} className="text-base font-bold text-titulo">
            {titulo}
          </h2>
          <p className="mt-0.5 text-sm text-texto-suave">{descripcion}</p>
        </div>
      </div>

      {children}
    </section>
  )
}
