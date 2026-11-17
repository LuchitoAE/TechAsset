import { Link } from 'react-router'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import { useSesion } from '../contextos/contextoDeSesion'
import { etiquetaDeRol } from '../reglas/catalogos'
import { accesosDelRol } from '../reglas/permisos'

// Panel de inicio: saludo, rol de la sesión y accesos a lo que ese rol puede hacer. Los indicadores
// del dashboard llegan en la iteración 5; aquí no se inventan cifras.
export default function PaginaInicio() {
  const { sesion } = useSesion()
  const accesos = accesosDelRol(sesion?.rol_usuario)

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo={`Hola, ${sesion?.nombres_usuario ?? ''}`}
        descripcion={`Sesión iniciada como ${etiquetaDeRol(sesion?.rol_usuario)}. Este es el punto de partida de sus tareas en TechAsset.`}
      />

      <section aria-labelledby="titulo-accesos" className="space-y-4">
        <h2 id="titulo-accesos" className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
          Accesos de su rol
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accesos.map((acceso) => (
            <Link
              key={acceso.ruta}
              to={acceso.ruta}
              className="group rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta transition-colors hover:border-marca-300 hover:bg-superficie-tenue"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-titulo">{acceso.titulo}</h3>
                <span
                  aria-hidden="true"
                  className="text-marca-700 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">{acceso.detalle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <h2 className="text-base font-bold text-titulo">Usuarios y acceso</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
            Registro, actualización, consulta y deshabilitación de cuentas. El correo es único y solo el
            Administrador puede deshabilitar usuarios.
          </p>
          <p className="mt-4 rounded-lg bg-exito-fondo px-3 py-2 text-xs font-semibold text-exito">
            Disponible desde la iteración 2
          </p>
        </article>

        <article className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta">
          <h2 className="text-base font-bold text-titulo">Equipos, préstamos y reportes</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
            El inventario, los préstamos con devolución y los seis indicadores del panel se integran en
            las iteraciones 3 a 5. El menú ya está preparado para su rol.
          </p>
          <p className="mt-4 rounded-lg bg-aviso-fondo px-3 py-2 text-xs font-semibold text-aviso">
            Próximas iteraciones
          </p>
        </article>
      </section>
    </div>
  )
}
