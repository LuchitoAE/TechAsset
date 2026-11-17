import { Link } from 'react-router'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'

// Sección prevista en el mapa de pantallas que se construye en una iteración posterior. Se deja la
// ruta y el menú listos para que las siguientes iteraciones solo agreguen la pantalla real.
export default function PaginaEnConstruccion({ titulo, descripcion, iteracion }) {
  return (
    <div className="space-y-6">
      <EncabezadoDePagina titulo={titulo} descripcion={descripcion} />

      <section className="rounded-2xl border border-dashed border-borde bg-superficie p-8 text-center sm:p-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-marca-600 uppercase">
          Iteración {iteracion}
        </p>
        <h2 className="mt-3 text-xl font-bold text-titulo">Esta sección todavía no está construida.</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-texto-suave">
          El menú y la ruta ya respetan su rol. La pantalla completa se integra en la iteración {iteracion},
          junto con sus consultas y pruebas.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-borde-fuerte bg-superficie px-4 text-sm font-semibold text-texto hover:bg-superficie-tenue"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  )
}
