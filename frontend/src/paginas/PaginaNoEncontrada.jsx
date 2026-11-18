import { Link } from 'react-router'

// Ruta desconocida: explica qué pasó y ofrece volver al inicio.
export default function PaginaNoEncontrada() {
  return (
    <main className="grid min-h-dvh place-items-center bg-fondo px-6">
      <section className="w-full max-w-md rounded-2xl border border-borde bg-superficie p-8 text-center shadow-tarjeta">
        <p className="text-5xl font-bold text-marca-300">404</p>
        <h1 className="mt-3 text-xl font-bold text-titulo">No encontramos esta página.</h1>
        <p className="mt-2 text-sm leading-relaxed text-texto-suave">
          El enlace puede estar incompleto o la pantalla cambió de lugar.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-marca-700 px-4 text-sm font-semibold text-sobre-marca hover:bg-marca-800"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
