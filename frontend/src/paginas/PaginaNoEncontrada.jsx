import { Link } from 'react-router'
import { useTituloDePagina } from '../utils/titulo'

// Ruta desconocida: explica qué pasó y ofrece volver al inicio. Se dibuja dentro del <main> del
// layout, por eso usa <section> y un h1, sin crear un segundo landmark main.
export default function PaginaNoEncontrada() {
  useTituloDePagina('Página no encontrada')

  return (
    <section
      aria-labelledby="titulo-no-encontrada"
      className="mx-auto w-full max-w-md rounded-2xl border border-borde bg-superficie p-8 text-center shadow-tarjeta"
    >
      <p aria-hidden="true" className="text-5xl font-bold text-marca-300">
        404
      </p>
      <h1 id="titulo-no-encontrada" className="mt-3 text-xl font-bold text-titulo">
        No encontramos esta página.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-texto-suave">
        El enlace puede estar incompleto o la pantalla cambió de lugar.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca hover:bg-marca-800"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
